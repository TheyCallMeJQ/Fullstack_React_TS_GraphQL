import { __prod__ } from "./constants";
import { Post } from "./entities/Post";

export default {
  dbName: "lireddit",
  entities: [Post],
  type: "postgresql",
  debug: !__prod__,
};
