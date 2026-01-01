import jwt from "@elysiajs/jwt";
import { Elysia } from "elysia";
import { env } from "../utils/env";

export const authTokenJwt = jwt({
  name: "auth_token",
  secret: env("AUTH_TOKEN_SECRET"),
});

export const authPlugin = new Elysia()
  .use(authTokenJwt)
  .resolve({ as: "scoped" }, async ({ auth_token, cookie: { auth }, set }) => {
    if (!auth || !auth.value) {
      set.status = 401;
      throw new Error("Unauthorized");
    }

    const { id } = (await auth_token.verify(auth.value as string)) as {
      id: string;
    };
    if (!id) {
      set.status = 401;
      throw new Error("Unauthorized");
    }

    return { userId: id };
  });
