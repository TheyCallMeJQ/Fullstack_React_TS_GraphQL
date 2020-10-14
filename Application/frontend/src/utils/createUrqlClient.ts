import { cacheExchange } from "@urql/exchange-graphcache";
import Router from "next/router";
import { dedupExchange, Exchange, fetchExchange } from "urql";
import { pipe, tap } from "wonka";
import {
  CreatePostMutation,
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  PostsDocument,
  PostsQuery,
  RegisterMutation,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";

const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes("Not authenticated")) {
        Router.replace("/login");
      }
    })
  );
};

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include" as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      updates: {
        Mutation: {
          //Not doing this properly
          // createPost: (result, args, cache, info) => {
          //   betterUpdateQuery<CreatePostMutation, PostsQuery>(
          //     cache,
          //     { query: PostsDocument },
          //     result,
          //     (newQueryResult, lastQueryResult) => {
          //       console.log("new query result", newQueryResult);
          //       console.log("last query result", lastQueryResult);
          //       let posts = [] as any;
          //       if (lastQueryResult) {
          //         posts = lastQueryResult.posts;
          //       }
          //       posts.concat({
          //         ...newQueryResult.createPost,
          //       });
          //       console.log("posts", posts);

          //       return {
          //         posts,
          //       };
          //     }
          //   );
          // },
          logout: (result, args, cache, info) => {
            betterUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              { query: MeDocument },
              result,
              () => ({
                me: null,
              })
            );
          },
          login: (result, args, cache, info) => {
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              result,
              (newQueryResult, lastQueryResult) => {
                if (newQueryResult.login.errors) {
                  return lastQueryResult;
                }
                return {
                  me: newQueryResult.login.user,
                };
              }
            );
          },
          register: (result, args, cache, info) => {
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              result,
              (newQueryResult, lastQueryResult) => {
                if (newQueryResult.register.errors) {
                  return lastQueryResult;
                }
                return {
                  me: newQueryResult.register.user,
                };
              }
            );
          },
        },
      },
    }),
    errorExchange,
    ssrExchange,
    fetchExchange,
  ],
});
