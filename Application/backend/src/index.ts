import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";

import { COOKIE_NAME, __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";

import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import connectRedis from "connect-redis";
import redis from "redis";
import session from "express-session";

import cors from "cors";
import { sendEmail } from "./utils/sendEmail";
import { User } from "./entities/User";

const main = async () => {
  sendEmail("bob@bob.com", "<a>Hello there!</a>");

  //Connect to MikroORM
  const orm = await MikroORM.init(microConfig);
  // Delete everything in User table
  // await orm.em.nativeDelete(User, {})

  // Find all entries in the User table to verify successful deletion
  // const users = await orm.em.find(User, {});
  // console.log("users", users);

  //Run migrations
  await orm.getMigrator().up();

  const PORT = 4000;
  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        //No access to cookie from frontend
        httpOnly: true,
        //Set cookie lifespan to 10 years
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        //Only work for https
        secure: __prod__,
        sameSite: "lax", //csrf
      },
      saveUninitialized: false,
      secret: "hbfwelmxlzwjdcdllw",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

main().catch((e) => {
  console.log(e);
});
