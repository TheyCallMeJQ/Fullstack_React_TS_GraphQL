import DataLoader from "dataloader";
import { Updoot } from "../entities/Updoot";

/**
 * Return the updoot for each passed in key of (userid, postid)
 */
export const createUpdootLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Updoot | null>(
    async (keys) => {
      console.group("updoot loader");
      // console.log("keys", keys);
      const updoots = await Updoot.findByIds(keys as any[]);

      const updootIdToUpdoot: Record<string, Updoot> = {};
      updoots.forEach((updoot) => {
        const key = `${updoot.postId}|${updoot.userId}`;
        updootIdToUpdoot[key] = updoot;
      });
      const sortedUpdootObjects = keys.map(
        (key) => updootIdToUpdoot[`${key.postId}|${key.userId}`]
      );
      console.log("sortedUpdoots", sortedUpdootObjects);

      console.groupEnd();
      return sortedUpdootObjects;
    }
  );
