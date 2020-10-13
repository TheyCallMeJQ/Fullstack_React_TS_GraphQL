import argon2 from "argon2";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  ObjectType,
  Resolver,
} from "type-graphql";
import { EntityManager } from "@mikro-orm/postgresql";
import { MyContext } from "src/types";
import { User } from "../entities/User";
import { COOKIE_NAME } from "../constants";

@InputType()
class UsernamePasswordInput {
  @Field(() => String)
  username: string;
  @Field(() => String)
  password: string;
}

@ObjectType()
class FieldError {
  @Field(() => String)
  field: string;
  @Field(() => String)
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email", () => String) email: string,
    @Ctx() { em }: MyContext
  ) {
    const user = await em.findOne(User, { email });
    if (!user) return false;
    console.log(`Found user with email ${email}\n`);
    console.log(user);

    return true;
  }

  /**
   * Return the user associated with the id on the current session.
   */
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Ctx() { em, req }: MyContext,
    @Arg("input", () => UsernamePasswordInput) input: UsernamePasswordInput
  ): Promise<UserResponse> {
    if (input.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "Length of provided username must be greater than 2.",
          },
        ],
      };
    }
    if (input.password.length <= 3) {
      return {
        errors: [
          {
            field: "password",
            message: "Length of provided password must be greater than 3.",
          },
        ],
      };
    }
    const hashedPassword = await argon2.hash(input.password);

    try {
      const [user] = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: input.username,
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning("*");

      //Store user ID on session
      //This will add a cookie on the session
      //Keep the user logged in
      req.session.userId = user.id;

      return { user };
    } catch (err) {
      console.log("message", err.message);
      if (err.code === "23505" || err.detail.includes("already exists")) {
        em.clear();
        //duplicate username error
        return {
          errors: [
            {
              message: "This username already exists",
              field: "username",
            },
          ],
        };
      }
      return {
        errors: [
          {
            message: "Something went wrong",
            field: "Unknown",
          },
        ],
      };
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Ctx() { em, req }: MyContext,
    @Arg("input", () => UsernamePasswordInput) input: UsernamePasswordInput
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: input.username });
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "That username doesn't exist",
          },
        ],
      };
    }
    const hashedPassword = user.password;
    const isGoodPassword = await argon2.verify(hashedPassword, input.password);
    if (!isGoodPassword) {
      return {
        errors: [
          {
            field: "password",
            message: "That password is incorrect",
          },
        ],
      };
    }

    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext): Promise<Boolean> {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        if (err) {
          resolve(false);
          return;
        }
        res.clearCookie(COOKIE_NAME);
        resolve(true);
      })
    );
    return false;
  }
}
