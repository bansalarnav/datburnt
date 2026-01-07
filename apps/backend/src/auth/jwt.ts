import jwt from "@elysiajs/jwt";
import { env } from "../util/env";

export const authTokenJwt = jwt({
  name: "auth_token",
  secret: env("AUTH_TOKEN_SECRET"),
});
