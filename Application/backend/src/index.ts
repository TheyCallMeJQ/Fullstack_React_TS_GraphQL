import { MikroORM } from "@mikro-orm/core";

import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";

import express from "express";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();

  const app = express();
  const PORT = 4000;

  app.get("/", (req, res) => {
    res.send("Hello world from Express!");
  });

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

main().catch((e) => {
  console.log(e);
});
