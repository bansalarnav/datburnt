import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { users } from "../db/schema";

export namespace User {
  export const Info = z.object({
    id: z.string(),
    username: z.string(),
    email: z.string(),
    avatar: z.string(),
  });
  export type Info = z.infer<typeof Info>;

  export const CreateInput = z.object({
    username: z.string().min(3),
    email: z.string(),
    password: z.string().min(6),
    avatar: z.string(),
  });
  export type CreateInput = z.infer<typeof CreateInput>;

  export function generateAvatarUrl(): string {
    const seed = randomString(8);
    return `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${seed}`;
  }

  function randomString(length: number): string {
    const chars =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz".split("");

    let str = "";
    for (let i = 0; i < length; i++) {
      str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
  }

  export async function create(input: CreateInput) {
    const [user] = await db.insert(users).values(input).returning();
    return user;
  }

  export async function findByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  export async function findByEmailOrUsername(email: string, username: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)));
    return user;
  }

  export async function findById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
}
