import { ThemeProvider, CSSReset } from "@chakra-ui/core";

import theme from "../theme";

import { createClient, dedupExchange, fetchExchange, Provider } from "urql";
import { cacheExchange, QueryInput, Cache } from "@urql/exchange-graphcache";
import {
  LoginMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
} from "../generated/graphql";

function betterUpdateQuery<Result, Query>(
  cache: Cache,
  queryInput: QueryInput,
  result: any,
  func: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(
    queryInput,
    (data) => func(result, data as any) as any
  );
}

const client = createClient({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include",
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      updates: {
        Mutation: {
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
    fetchExchange,
  ],
});

function MyApp({ Component, pageProps }: any) {
  return (
    <Provider value={client}>
      <ThemeProvider theme={theme}>
        <CSSReset />
        <Component {...pageProps} />
      </ThemeProvider>
    </Provider>
  );
}

export default MyApp;
