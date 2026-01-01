import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { db } from "../db";
import { users } from "../db/schema";
import { authTokenJwt } from "../plugins/auth";
import makeid from "../utils/makeid";

export const gameWebSocket = new Elysia()
  .use(authTokenJwt)
  .resolve(async ({ auth_token, cookie, query }) => {
    const token = cookie.auth;
    if (!token || !token.value) {
      const name = query.name;
      if (!name || typeof name !== "string" || name.length === 0) {
        return;
      }

      const id = `guest-${makeid(6)}`;
      const avatar = `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${id}`;
      return { id, name, avatar };
    }

    const { id: userId } = (await auth_token.verify(token.value as string)) as {
      id: string;
    };

    if (!userId) return;
    const [user] = await db
      .select({
        id: users.id,
        name: users.username,
        avatar: users.avatar,
      })
      .from(users)
      .where(eq(users.id, userId));

    return { user };
  })
  .ws("/game", {
    open(ws) {
      console.log("attemping connection");
      if (!ws.data.user) {
        ws.close();
      }

      console.log(ws.data.user);
    },
  });
