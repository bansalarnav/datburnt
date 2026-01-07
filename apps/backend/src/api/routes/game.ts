import { Elysia, t } from "elysia";
import { authPlugin } from "../../auth/middleware";
import { GameRegistry } from "../../game/registry";
import { makeGameId } from "../../util/id";

export const gameRoutes = new Elysia({ prefix: "/game" }).use(authPlugin).post(
  "/",
  async ({ userId, body, set }) => {
    try {
      const { maxPlayers } = body;

      let gameId: string | null = null;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts && !gameId) {
        const candidateId = makeGameId();
        const existingGame = GameRegistry.get(candidateId);

        if (!existingGame) {
          gameId = candidateId;
        }
        attempts++;
      }

      if (!gameId) {
        set.status = 500;
        return {
          success: false,
          message: "Failed to generate unique game ID. Please try again.",
        };
      }

      const game = GameRegistry.create(gameId, userId, maxPlayers);

      return {
        success: true,
        game: game.toJSON(),
      };
    } catch (_error) {
      set.status = 500;
      return {
        success: false,
        message: "An error occurred while creating the game",
      };
    }
  },
  {
    body: t.Object({
      maxPlayers: t.Number({ minimum: 4, maximum: 8 }),
    }),
  }
);
