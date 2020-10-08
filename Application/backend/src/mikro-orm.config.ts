import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"), // path to the folder with migrations
    pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files (.js or .ts)
  },
  dbName: "lireddit",
  entities: [Post, User],
  type: "postgresql",
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
