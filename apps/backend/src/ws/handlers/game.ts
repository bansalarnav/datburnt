import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { db } from "../../db";
import { users } from "../../db/schema";
import { authTokenJwt } from "../../auth/jwt";
import { GameRegistry } from "../../game/registry";
import makeid from "../../util/id";

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
      if (!ws.data.user) {
        ws.close();
        return;
      }

      const user = ws.data.user;

      const gameId = ws.data.query?.gameId;
      if (!gameId || typeof gameId !== "string") {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Game ID is required",
          })
        );
        ws.close();
        return;
      }

      const game = GameRegistry.get(gameId);
      if (!game) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Game not found",
          })
        );
        ws.close();
        return;
      }

      const result = game.addPlayer(ws, user);
      if (!result.success) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: result.error,
          })
        );
        ws.close();
        return;
      }
    },
    message(ws, message) {
      const data = JSON.parse(message as string);
      const gameId = ws.data.query?.gameId;
      const game = GameRegistry.get(gameId as string);

      if (!game || !ws.data.user) return;

      if (data.type === "kick_player") {
        const result = game.kickPlayer(data.playerId, ws.data.user.id);
        if (!result.success) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: result.error,
            })
          );
        }
      }
    },
    close(ws) {
      const gameId = ws.data.query?.gameId;
      const game = GameRegistry.get(gameId as string);

      if (game && ws.data.user) {
        game.removePlayer(ws.data.user.id);
      }
    },
  });
