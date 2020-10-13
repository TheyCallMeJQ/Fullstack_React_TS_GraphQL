import { QueryInput, Cache } from "@urql/exchange-graphcache";

export function betterUpdateQuery<Result, Query>(
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
