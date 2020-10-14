import argon2 from "argon2";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  Query,
  ObjectType,
  Resolver,
} from "type-graphql";
import { MyContext } from "src/types";
import { User } from "../entities/User";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import validateRegister from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";

import { v4 } from "uuid";

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
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) return false;

    const token = v4();
    const key = FORGET_PASSWORD_PREFIX + token;
    await redis.set(key, user.id, "ex", 1000 * 60 * 60 * 24 * 3); //expire in three days

    const htmlText = `<a href="http://localhost:3000/change-password/${token}">Change password</a>`;
    await sendEmail(email, htmlText);

    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token", () => String) token: string,
    @Arg("newPassword", () => String) newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 1) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "Length of provided password must be greater than 1.",
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const id = await redis.get(key);
    if (!id) {
      return {
        errors: [
          {
            field: "token",
            message: "Token expired.",
          },
        ],
      };
    }
    const user = await User.findOne({ where: { id: parseInt(id) } });
    if (!user) {
      return {
        errors: [{ field: "user", message: "No user found for provided id" }],
      };
    }

    //Change the user's password on db
    await User.update(
      { id: user.id },
      { password: await argon2.hash(newPassword) }
    );

    //Destroy token on password reset
    await redis.del(key);

    //Login the user after password change
    req.session.userId = user.id;

    return { user };
  }

  /**
   * Return the user associated with the id on the current session.
   */
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    return await User.findOne({
      where: { id: req.session.userId },
    });
  }

  @Mutation(() => UserResponse)
  async register(
    @Ctx() { req }: MyContext,
    @Arg("input", () => UsernamePasswordInput) input: UsernamePasswordInput
  ): Promise<UserResponse> {
    const errors = validateRegister(input);
    if (errors) return { errors };

    const hashedPassword = await argon2.hash(input.password);

    try {
      const { username, email } = input;
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
      }).save();

      //Store user ID on session
      //This will add a cookie on the session
      //Keep the user logged in
      req.session.userId = user.id;

      return { user };
    } catch (err) {
      console.log("register: error", err);
      if (err.code === "23505" || err.detail.includes("already exists")) {
        const field = err.detail.includes("username") ? "username" : "email";
        //duplicate username error
        return {
          errors: [
            {
              message: `This ${field} already exists`,
              field,
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
    @Ctx() { req }: MyContext,
    @Arg("usernameOrEmail", () => String) usernameOrEmail: string,
    @Arg("password", () => String) password: string
  ): Promise<UserResponse> {
    let user = null;
    const isEmail = (arg: String) => arg.includes("@");
    if (isEmail(usernameOrEmail)) {
      user = await User.findOne({ where: { email: usernameOrEmail } });
      if (!user) {
        return {
          errors: [
            {
              field: "usernameOrEmail",
              message: "That email doesn't exist",
            },
          ],
        };
      }
    } else {
      user = await User.findOne({ where: { username: usernameOrEmail } });
      if (!user) {
        return {
          errors: [
            {
              field: "usernameOrEmail",
              message: "That username doesn't exist",
            },
          ],
        };
      }
    }

    const hashedPassword = user.password;
    const isGoodPassword = await argon2.verify(hashedPassword, password);
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
  }
}
