import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";

const main = async () => {
  console.log("Hello orld");
  const orm = await MikroORM.init({
    dbName: "lireddit",
    type: "postgresql",
    debug: !__prod__,
  });
};

main();
