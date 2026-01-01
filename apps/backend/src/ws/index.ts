import { Elysia } from "elysia";
import { gameWebSocket } from "./game";

export const websocketRoutes = new Elysia({ prefix: "/ws" }).use(gameWebSocket);
