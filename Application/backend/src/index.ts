import "reflect-metadata";
//ensure we define our environment variables
import "dotenv-safe/config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";

import { COOKIE_NAME, __prod__ } from "./constants";

import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import connectRedis from "connect-redis";
import Redis from "ioredis";
import session from "express-session";

import cors from "cors";
import { User } from "./entities/User";

import { createConnection } from "typeorm";
import { Post } from "./entities/Post";
import { Updoot } from "./entities/Updoot";
import path from "path";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";

const main = async () => {
  const connection = await createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL,
    logging: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [User, Post, Updoot],
  });
  //Run any un-run migrations
  // await connection.runMigrations();

  const app = express();

  const RedisStore = connectRedis(session);
  //initialize redis client
  const redis = new Redis(process.env.REDIS_URL);
  //Ensure cookies work properly
  app.set("trust proxy", 1);
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redis, disableTouch: true }),
      cookie: {
        //No access to cookie from frontend
        httpOnly: true,
        //Set cookie lifespan to 10 years
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        //Only work for https
        secure: __prod__,
        sameSite: "lax", //csrf
        //We specify a domain to avoid a bug with cookies on deployment
        domain: __prod__ ? ".jacquespamiot.com" : undefined,
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      updootLoader: createUpdootLoader(),
    }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);
  });
};

main().catch((e) => {
  console.log(e);
});
