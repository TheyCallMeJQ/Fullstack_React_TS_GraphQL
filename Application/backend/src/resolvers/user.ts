import { MyContext } from "src/types";
import argon2 from "argon2";
import { Arg, Ctx, Field, InputType, Mutation, Resolver } from "type-graphql";
import { User } from "../entities/User";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field(() => String)
  password: string;
}

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Ctx() { em }: MyContext,
    @Arg("input", () => UsernamePasswordInput) input: UsernamePasswordInput
  ) {
    const { username, password } = input;
    const hashedPassword = await argon2.hash(password);
    const user = em.create(User, { username, password: hashedPassword });
    await em.persistAndFlush(user);
    return user;
  }
}
