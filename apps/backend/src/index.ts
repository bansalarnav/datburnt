import { cookie } from "@elysiajs/cookie";
import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { gameRoutes } from "./api/routes/game";
import { userRoutes } from "./api/routes/user";
import config from "./config";
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
  .get("/", () => "Hello World!")
  .use(userRoutes)
  .use(gameRoutes)
  .use(websocketRoutes)
  .listen(port);

console.log(`Server started at ${app.server?.hostname}:${app.server?.port}`);
