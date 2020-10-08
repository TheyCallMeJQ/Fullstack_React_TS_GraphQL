import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  post(
    @Ctx() { em }: MyContext,
    @Arg("id", () => Int) id: number
  ): Promise<Post | null> {
    const post = em.findOne(Post, { id });
    return post;
  }

  @Mutation(() => Post)
  async createPost(
    @Ctx() { em }: MyContext,
    @Arg("title", () => String) title: string
  ): Promise<Post> {
    const post = em.create(Post, { title });
    await em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Ctx() { em }: MyContext,
    @Arg("id", () => Number) id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });
    if (!post) {
      return null;
    }
    if (typeof title !== undefined) {
      post.title = title;
      await em.persistAndFlush(post);
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Ctx() { em }: MyContext,
    @Arg("id", () => Number) id: number
  ): Promise<boolean> {
    try {
      await em.nativeDelete(Post, { id });
      return true;
    } catch (e) {
      console.log("Error", e);
    }
    return false;
  }
}
