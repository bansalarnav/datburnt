import { db } from '../db';
import { users, type User, type NewUser } from '../db/schema';
import { eq } from 'drizzle-orm';

export type { User, NewUser };

export const UserModel = {
  async findOne(where: { id?: string; email?: string; name?: string }) {
    if (where.id) {
      const result = await db.select().from(users).where(eq(users.id, where.id)).limit(1);
      return result[0] || null;
    }
    if (where.email) {
      const result = await db.select().from(users).where(eq(users.email, where.email)).limit(1);
      return result[0] || null;
    }
    if (where.name) {
      const result = await db.select().from(users).where(eq(users.name, where.name)).limit(1);
      return result[0] || null;
    }
    return null;
  },

  async create(user: NewUser) {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  },

  async update(id: string, data: Partial<User>) {
    const result = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return result[0];
  },

  async addFriend(userId: string, friendId: string) {
    const user = await this.findOne({ id: userId });
    if (!user) throw new Error('User not found');
    
    const friends = user.friends || [];
    if (!friends.includes(friendId)) {
      friends.push(friendId);
      return await this.update(userId, { friends });
    }
    return user;
  },
};

export default UserModel;
