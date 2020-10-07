import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";

const main = async () => {
  console.log("Hello orld");
  const orm = await MikroORM.init({
    dbName: "lireddit",
    entities: [Post],
    type: "postgresql",
    debug: !__prod__,
  });

  //Create a new Post (does not affect db)
  const post = orm.em.create(Post, { title: "My first post" });
  await orm.em.persistAndFlush(post);
  console.log("--------------SQL 2-------------------");
  await orm.em.persistAndFlush(post);
};

main().catch((e) => {
  console.log(e);
});
