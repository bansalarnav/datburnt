import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { db } from "../db";
import { users } from "../db/schema";
import { authTokenJwt } from "../plugins/auth";
import { Room } from "../state/room";
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
      if (!ws.data.user) {
        ws.close();
        return;
      }

      const user = ws.data.user;

      const roomId = ws.data.query?.roomId;
      if (!roomId || typeof roomId !== "string") {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Room ID is required",
          })
        );
        ws.close();
        return;
      }

      const room = Room.get(roomId);
      if (!room) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Room not found",
          })
        );
        ws.close();
        return;
      }

      // Try to join the room
      const result = room.addPlayer(ws, user);
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
      const roomId = ws.data.query?.roomId;
      const room = Room.get(roomId as string);

      if (!room || !ws.data.user) return;

      if (data.type === "kick_player") {
        const result = room.kickPlayer(data.playerId, ws.data.user.id);
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
      const roomId = ws.data.query?.roomId;
      const room = Room.get(roomId as string);

      if (room && ws.data.user) {
        room.removePlayer(ws.data.user.id);
      }
    },
  });
