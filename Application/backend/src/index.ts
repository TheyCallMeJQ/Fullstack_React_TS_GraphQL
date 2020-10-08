import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";

import { __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";

import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";

const main = async () => {
  //Connect to MikroORM
  const orm = await MikroORM.init(microConfig);
  //Run migrations
  await orm.getMigrator().up();

  const PORT = 4000;
  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

main().catch((e) => {
  console.log(e);
});
