import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import gql from "graphql-tag";
import Router from "next/router";
import {
  dedupExchange,
  Exchange,
  fetchExchange,
  stringifyVariables,
} from "urql";
import { pipe, tap } from "wonka";
import {
  DeletePostMutationVariables,
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
  VoteMutationVariables,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { isServer } from "./isServer";

export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    // console.log("entityKey", entityKey, "fieldName", fieldName);
    const allFields = cache.inspectFields(entityKey);
    // console.log("allFields", allFields);
    // console.log("fieldArgs", fieldArgs);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    //ex.: posts({"limit":10})
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    // console.log("fieldKey", fieldKey);

    const isItInTheCache = cache.resolveFieldByKey(entityKey, fieldKey);
    // console.log("Is it in the cache?", isItInTheCache);
    info.partial = !isItInTheCache;

    let hasMore = true;
    //Read and return the data from the cache
    const results: string[] = [];
    fieldInfos.forEach((fi) => {
      const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, "posts") as string[]; //resolve for our 'posts' field of our PaginatedPosts
      const _hasMore = cache.resolve(key, "hasMore") as boolean; //resolve for our 'posts' field of our PaginatedPosts
      if (!_hasMore) {
        hasMore = _hasMore;
      }
      results.push(...data);
    });
    return {
      __typename: "PaginatedPosts",
      hasMore,
      posts: results,
    };
  };
};

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

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = "";
  //only execute this code on the server
  if (isServer()) {
    // Intercept our request coming from client-side, passing through our NextJS Server
    // Ensure the cookie makes it to the GraphQL API by including it in our headers, below
    cookie = ctx?.req?.headers?.cookie;
  }
  return {
    url: "http://localhost:4000/graphql",
    fetchOptions: {
      credentials: "include" as const,
      headers: cookie ? { cookie } : undefined,
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null,
        },
        resolvers: {
          Query: {
            posts: cursorPagination(),
          },
        },
        updates: {
          Mutation: {
            //A template
            // deletePost: (result, args, cache, info) => {},
            deletePost: (_, args, cache, __) => {
              //Any deleted posts are set to null
              cache.invalidate({
                __typename: "Post",
                id: (args as DeletePostMutationVariables).id,
              });
            },
            vote: (_, args, cache, __) => {
              console.group("[DEV] URQL client update vote");

              const { postId, value } = args as VoteMutationVariables;
              const data = cache.readFragment(
                gql`
                  fragment __ on Post {
                    id
                    points
                    voteStatus
                  }
                `,
                { id: postId } as any
              );
              console.log("data", data);

              if (data) {
                //If the user already voted, and chose the same vote
                if (data.voteStatus === value) {
                  return;
                }
                //If the user hasn't voted before, vote for one point either positive or negative
                //If the user already voted, and chose a different vote, then vote for two points in their new direction
                const newPoints =
                  (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
                cache.writeFragment(
                  gql`
                    fragment _ on Post {
                      points
                      voteStatus
                    }
                  `,
                  {
                    id: postId,
                    points: newPoints,
                    voteStatus: value,
                  } as any
                );
              }
              console.groupEnd();
            },
            createPost: (_, __, cache, ___) => {
              console.group("Helpful debugs");
              // console.log(cache.inspectFields("Query"));
              const allFields = cache.inspectFields("Query");
              const fieldInfos = allFields.filter(
                (info) => info.fieldName === "posts"
              );
              fieldInfos.forEach((fI) => {
                cache.invalidate("Query", "posts", fI.arguments || {});
              });

              // console.log(cache.inspectFields("Query"));
              console.groupEnd();
            },
            logout: (result, _, cache, __) => {
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                result,
                () => ({
                  me: null,
                })
              );
            },
            login: (result, _, cache, __) => {
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
            register: (result, _, cache, __) => {
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
  };
};
