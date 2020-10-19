import DataLoader from "dataloader";
import { User } from "../entities/User";

/**
 * Return the user for each passed in user id.
 */
export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    // Note: the order of the userIds is IMPORTANT.

    // console.group("user loader");
    const users = await User.findByIds(userIds as number[]);
    // console.log("users", users);
    const userIdToUser: Record<number, User> = {};
    users.forEach((user) => (userIdToUser[user.id] = user));
    // console.log("userIdToUser", userIdToUser);
    const sortedUserObjects = userIds.map((userId) => userIdToUser[userId]);
    // console.log("result", result);

    // console.groupEnd();
    return sortedUserObjects;
  });
