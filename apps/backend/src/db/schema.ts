import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("name").notNull().unique(),
  email: text("email").notNull().unique(),
  avatar: text("avatar").notNull(),
  password: text("password").notNull(),
});
