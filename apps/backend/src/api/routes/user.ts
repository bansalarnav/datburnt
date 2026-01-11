import { Elysia, t } from "elysia";
import { authTokenJwt } from "../../auth/jwt";
import { authPlugin } from "../../auth/middleware";
import { validateEmail } from "../../auth/validation";
import config from "../../config";
import { hashPassword, verifyPassword } from "../../user/password";
import { User } from "../../user/user";

export const userRoutes = new Elysia({ prefix: "/user" })
  .use(authTokenJwt)
  .post(
    "/register",
    async ({ auth_token, body, cookie: { auth }, set }) => {
      try {
        const avatarUrl = User.generateAvatarUrl();

        const validEmail = validateEmail(body.email);
        if (!validEmail) return { success: false, message: "Invalid Email ID" };

        const existingUser = await User.findByEmailOrUsername(
          body.email,
          body.username
        );
        if (existingUser) {
          set.status = 400;
          return {
            message: "User with this email or username already exists",
          };
        }

        const hashed = await hashPassword(body.password);
        const user = await User.create({
          username: body.username,
          email: body.email,
          password: hashed,
          avatar: avatarUrl,
        });

        const jwtToken = await auth_token.sign({ id: user.id });
        console.log(jwtToken);

        auth.value = jwtToken;
        auth.httpOnly = config.cookieConfig.httpOnly;
        auth.maxAge = config.cookieConfig.maxAge;
        if (config.cookieConfig.secure)
          auth.secure = config.cookieConfig.secure;
        if (config.cookieConfig.sameSite)
          auth.sameSite = config.cookieConfig.sameSite;
        if (config.cookieConfig.domain)
          auth.domain = config.cookieConfig.domain;

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
      cookie: { auth },
      set,
    }) => {
      try {
        const user = await User.findByEmail(email);
        if (!user) {
          set.status = 400;
          return {
            success: false,
            message: "User with this email does not exist",
          };
        }

        const match = await verifyPassword(password, user.password);
        if (!match) return { success: false, message: "Invalid Credentials" };

        const jwtToken = await auth_token.sign({ id: user.id });

        const { password: _, ...userWithoutPassword } = user;

        auth.value = jwtToken;
        auth.httpOnly = config.cookieConfig.httpOnly;
        auth.maxAge = config.cookieConfig.maxAge;
        if (config.cookieConfig.secure)
          auth.secure = config.cookieConfig.secure;
        if (config.cookieConfig.sameSite)
          auth.sameSite = config.cookieConfig.sameSite;
        if (config.cookieConfig.domain)
          auth.domain = config.cookieConfig.domain;

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
        const user = await User.findById(userId);
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
      .put(
        "/username",
        async ({ userId, body, set }) => {
          try {
            const updatedUser = await User.updateUsername(
              userId,
              body.username
            );
            const { password: _, ...userWithoutPassword } = updatedUser;

            return { success: true, user: userWithoutPassword };
          } catch (_e) {
            set.status = 500;
            return { success: false, message: "Failed to update username" };
          }
        },
        {
          body: t.Object({
            username: t.String({ minLength: 3 }),
          }),
        }
      )
      .put(
        "/password",
        async ({ userId, body, set }) => {
          try {
            const user = await User.findById(userId);
            if (!user) {
              set.status = 400;
              return { success: false, message: "User not found" };
            }

            const match = await verifyPassword(body.oldPassword, user.password);
            if (!match) {
              set.status = 400;
              return { success: false, message: "Incorrect old password" };
            }

            const hashed = await hashPassword(body.newPassword);
            await User.updatePassword(userId, hashed);

            return { success: true, message: "Password updated successfully" };
          } catch (_e) {
            set.status = 500;
            return { success: false, message: "Failed to update password" };
          }
        },
        {
          body: t.Object({
            oldPassword: t.String(),
            newPassword: t.String({ minLength: 6 }),
          }),
        }
      )
      .post("/avatar/regenerate", async ({ userId, set }) => {
        try {
          const newAvatarUrl = User.generateAvatarUrl();
          const updatedUser = await User.updateAvatar(userId, newAvatarUrl);
          const { password: _, ...userWithoutPassword } = updatedUser;

          return { success: true, user: userWithoutPassword };
        } catch (_e) {
          set.status = 500;
          return { success: false, message: "Failed to regenerate avatar" };
        }
      })
  );
