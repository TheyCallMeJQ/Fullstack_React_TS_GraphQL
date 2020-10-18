import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import Router from "next/router";
import {
  dedupExchange,
  Exchange,
  fetchExchange,
  stringifyVariables,
} from "urql";
import { pipe, tap } from "wonka";
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";

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

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include" as const,
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
          createPost: (result, args, cache, info) => {
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
