import { eq, or } from "drizzle-orm";
import { Elysia, t } from "elysia";
import config from "../config";
import { db } from "../db";
import { users } from "../db/schema";
import { authPlugin, authTokenJwt } from "../plugins/auth";
import { hashPassword, validateEmail, verifyPassword } from "../utils/auth";

function randomString(length: number): string {
  const chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz".split("");

  if (!length) {
    length = Math.floor(Math.random() * chars.length);
  }

  let str = "";
  for (let i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}

export const userRoutes = new Elysia({ prefix: "/user" })
  .use(authTokenJwt)
  .post(
    "/register",
    async ({ auth_token, body, cookie: { auth }, set }) => {
      try {
        const avatarUrl = `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${randomString(8)}`;

        const validEmail = validateEmail(body.email);
        if (!validEmail) return { success: false, message: "Invalid Email ID" };

        const [existingUser] = await db
          .select()
          .from(users)
          .where(
            or(eq(users.email, body.email), eq(users.username, body.username))
          );
        if (existingUser) {
          set.status = 400;
          return {
            message: "User with this email or username already exists",
          };
        }

        const hashed = await hashPassword(body.password);
        const [user] = await db
          .insert(users)
          .values({
            username: body.username,
            email: body.email,
            password: hashed,
            avatar: avatarUrl,
          })
          .returning();

        const jwtToken = auth_token.sign({ id: user.id });

        auth.value = jwtToken;
        auth.httpOnly = config.cookieConfig.httpOnly;
        auth.maxAge = config.cookieConfig.maxAge;
        if (config.cookieConfig.secure)
          auth.secure = config.cookieConfig.secure;
        if (config.cookieConfig.sameSite)
          auth.sameSite = config.cookieConfig.sameSite;

        return { success: true, userId: user.id };
      } catch (_e) {
        return { success: false, message: "An error occured" };
      }
    },
    {
      body: t.Object({
        username: t.String({ minLength: 3 }),
        email: t.String(),
        password: t.String({ minLength: 6 }),
      }),
    }
  )
  .post(
    "/login",
    async ({
      auth_token,
      body: { email, password },
      cookie: { token: auth },
      set,
    }) => {
      try {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email));
        if (!user) {
          set.status = 400;
          return {
            success: false,
            message: "User with this email does not exist",
          };
        }

        const match = await verifyPassword(password, user.password);
        if (!match) return { success: false, message: "Invalid Credentials" };

        const jwtToken = auth_token.sign({ id: user.id });

        const { password: _, ...userWithoutPassword } = user;

        auth.value = jwtToken;
        auth.httpOnly = config.cookieConfig.httpOnly;
        auth.maxAge = config.cookieConfig.maxAge;
        if (config.cookieConfig.secure)
          auth.secure = config.cookieConfig.secure;
        if (config.cookieConfig.sameSite)
          auth.sameSite = config.cookieConfig.sameSite;

        return { success: true, user: userWithoutPassword };
      } catch (_e) {
        return { success: false, message: "An unexpected error occured" };
      }
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .guard({}, (app) =>
    app
      .use(authPlugin)
      .get("/me", async ({ userId, set }) => {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, userId));
        if (!user) {
          set.status = 400;
          return { success: false, message: "Invalid Token" };
        }

        const { password: _, ...userWithoutPassword } = user;
        return { success: true, user: userWithoutPassword };
      })
      .post("/logout", async ({ cookie: { auth } }) => {
        auth.remove();
        return { success: true };
      })
  );
