import { MyContext } from "src/types";
import argon2 from "argon2";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from "type-graphql";
import { User } from "../entities/User";

@InputType()
class UsernamePasswordInput {
  @Field()
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
  @Mutation(() => UserResponse)
  async register(
    @Ctx() { em }: MyContext,
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
    const user = em.create(User, {
      username: input.username,
      password: hashedPassword,
    });
    try {
      await em.persistAndFlush(user);
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
    return { user };
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

    // req.session.userId = user.id;
    req.session!.userId = user.id;
    return { user };
  }
}
