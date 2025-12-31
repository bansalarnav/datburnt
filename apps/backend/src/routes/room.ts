import { Elysia, t } from "elysia";
import { authPlugin } from "../plugins/auth";
import { Room } from "../state/room";
import { makeRoomId } from "../utils/makeid";

export const roomRoutes = new Elysia({ prefix: "/room" }).use(authPlugin).post(
  "/",
  async ({ userId, body, set }) => {
    try {
      const { maxPlayers } = body;

      let roomId: string | null = null;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts && !roomId) {
        const candidateId = makeRoomId();
        const existingRoom = Room.get(candidateId);

        if (!existingRoom) {
          roomId = candidateId;
        }
        attempts++;
      }

      if (!roomId) {
        set.status = 500;
        return {
          success: false,
          message: "Failed to generate unique room ID. Please try again.",
        };
      }

      const room: Room.Info = {
        id: roomId,
        owner: userId,
        maxPlayers,
        players: [],
      };

      Room.create(room);

      return {
        success: true,
        room,
      };
    } catch (_error) {
      set.status = 500;
      return {
        success: false,
        message: "An error occurred while creating the room",
      };
    }
  },
  {
    body: t.Object({
      maxPlayers: t.Number({ minimum: 4, maximum: 8 }),
    }),
  }
);
