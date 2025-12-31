import { cookie } from "@elysiajs/cookie";
import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import config from "./config";
import { roomRoutes } from "./routes/room";
import { userRoutes } from "./routes/user";
import { websocketRoutes } from "./ws";

const port = config.PORT;

const app = new Elysia()
  .use(cookie())
  .use(
    cors({
      origin: config.allowedOrigins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "x-auth-token",
        "Authorization",
      ],
    })
  )
  .get("/", () => "Hare Rama")
  .use(userRoutes)
  .use(roomRoutes)
  .use(websocketRoutes)
  .listen(port);

console.log(`Server started at ${app.server?.hostname}:${app.server?.port}`);

console.log("Note: WebSocket functionality needs to be migrated separately.");
console.log(
  "The original Socket.io code has been converted to TypeScript in websocket/*.ts files."
);
