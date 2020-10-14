import { Post } from "../entities/Post";

import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { MyContext } from "src/types";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(): Promise<Post[]> {
    return Post.find();
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Number) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  // @Mutation(() => Post)
  // async createPost(@Arg("title", () => String) title: string): Promise<Post> {
  //   return Post.create({ title }).save();
  // }

  @Mutation(() => Post)
  async createPost(
    @Ctx() { req }: MyContext,
    @Arg("input", () => PostInput) input: PostInput
  ): Promise<Post> {
    //Disable post for users not signed in
    if (!req.session.userId) throw new Error("User is not signed in");
    return Post.create({ ...input, creatorId: req.session.userId }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id", () => Number) id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }
    if (typeof title !== undefined) {
      await Post.update({ id }, { title });
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id", () => Number) id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
