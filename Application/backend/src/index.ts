import { MikroORM } from "@mikro-orm/core";

import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();

  //Create a new Post (does not affect db)
  const post = orm.em.create(Post, { title: "My first post" });
  await orm.em.persistAndFlush(post);
  console.log("--------------SQL 2-------------------");
  await orm.em.nativeInsert(Post, { title: "My first title 2" });
};

main().catch((e) => {
  console.log(e);
});
