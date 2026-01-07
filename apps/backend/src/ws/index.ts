import { Elysia } from "elysia";
import { gameWebSocket } from "./handlers/game";

export const websocketRoutes = new Elysia({ prefix: "/ws" }).use(gameWebSocket);
