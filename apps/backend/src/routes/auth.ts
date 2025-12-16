import { Elysia, t } from 'elysia';
import UserModel from '../models/User';
import config from '../config';
import jwt from 'jsonwebtoken';
import { auth } from '../middleware/auth';

async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10,
  });
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await Bun.password.verify(password, hash);
}

const validateEmail = (email: string): boolean => {
  return !!String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

function randomString(length: number): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz'.split('');

  if (!length) {
    length = Math.floor(Math.random() * chars.length);
  }

  let str = '';
  for (let i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}

export const authRoutes = new Elysia({ prefix: '/auth' })
  .post('/register', async ({ body, cookie: { token } }) => {
    try {
      const newUser = {
        name: body.username,
        avatar: `https://avatars.dicebear.com/api/adventurer-neutral/${randomString(8)}.svg`,
        email: body.email,
        password: body.password,
      };

      if (
        !newUser.email ||
        newUser.email === '' ||
        newUser.email.trim() === '' ||
        !newUser.name ||
        newUser.name === '' ||
        newUser.name.trim() === '' ||
        !newUser.password ||
        newUser.password === '' ||
        newUser.password.trim() === '' ||
        !newUser.avatar ||
        newUser.avatar === '' ||
        newUser.avatar.trim() === ''
      ) {
        return {
          success: false,
          message: 'All fields are required.',
        };
      }

      const validEmail = validateEmail(newUser.email);
      if (!validEmail)
        return { success: false, message: 'Invalid Email ID' };

      const doesUserExist = await UserModel.findOne({ email: newUser.email });
      if (doesUserExist)
        return {
          success: false,
          message: 'User with email already exists',
        };

      const doesUserExistPartTwo = await UserModel.findOne({ name: newUser.name });
      if (doesUserExistPartTwo)
        return {
          success: false,
          message: 'User with this username already exists',
        };

      const hashed = await hashPassword(newUser.password);
      const user = await UserModel.create({ ...newUser, password: hashed });

      const jwtToken = jwt.sign({ id: user.id }, process.env.JWT_KEY!);

      token.value = jwtToken;
      token.httpOnly = config.cookieConfig.httpOnly;
      token.maxAge = config.cookieConfig.maxAge;
      if (config.cookieConfig.secure) token.secure = config.cookieConfig.secure;
      if (config.cookieConfig.sameSite) token.sameSite = config.cookieConfig.sameSite;

      return { success: true, userId: user.id };
    } catch (e) {
      console.log(e);
      return { success: false, message: 'An error occured in /register' };
    }
  }, {
    body: t.Object({
      username: t.String(),
      email: t.String(),
      password: t.String(),
    })
  })
  .use(auth)
  .get('/me', async ({ user, error }) => {
    if (error || !user) {
      return error;
    }

    const foundUser = await UserModel.findOne({ id: user.id });
    if (!foundUser) return { success: false, message: 'Invalid Token' };

    const { password, ...userWithoutPassword } = foundUser;
    return { success: true, user: userWithoutPassword };
  })
  .post('/login', async ({ body, cookie: { token } }) => {
    try {
      const email = body.email;
      const pswd = body.password;

      const user = await UserModel.findOne({ email });
      if (!user)
        return {
          success: false,
          message: 'User with this email does not exist',
        };

      const match = await verifyPassword(pswd, user.password);
      if (!match)
        return { success: false, message: 'Invalid Credentials' };

      const jwtToken = jwt.sign({ id: user.id }, process.env.JWT_KEY!);
      
      const { password, ...userWithoutPassword } = user;

      token.value = jwtToken;
      token.httpOnly = config.cookieConfig.httpOnly;
      token.maxAge = config.cookieConfig.maxAge;
      if (config.cookieConfig.secure) token.secure = config.cookieConfig.secure;
      if (config.cookieConfig.sameSite) token.sameSite = config.cookieConfig.sameSite;

      return { success: true, user: userWithoutPassword };
    } catch (e) {
      console.log(e);
      return { success: false, message: e };
    }
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    })
  })
  .post('/logout', async ({ cookie: { token }, user, error }) => {
    if (error || !user) {
      return error;
    }

    token.remove();
    return { success: true };
  })
  .post('/add-frand', async ({ body, user, error }) => {
    if (error || !user) {
      return error;
    }

    try {
      const userId = user.id;
      const friendId = body.friendId;
      const foundUser = await UserModel.findOne({ id: userId });
      const friend = await UserModel.findOne({ id: friendId });

      if (!foundUser || !friend) {
        return { success: false, message: 'User not found' };
      }

      if (foundUser.friends && foundUser.friends.includes(friendId)) {
        return { success: false, message: 'Already friends' };
      }

      await UserModel.addFriend(userId, friendId);

      return { success: true };
    } catch (e) {
      console.log(e);
      return { success: false, message: 'An error occured in /add-frand' };
    }
  }, {
    body: t.Object({
      friendId: t.String(),
    })
  })
  .post('/getUser', async ({ body, user, error }) => {
    if (error || !user) {
      return error;
    }

    const username = body.username;
    const foundUser = await UserModel.findOne({ name: username });
    if (!foundUser) return { success: false, message: 'Invalid Token' };

    const { password, ...userWithoutPassword } = foundUser;
    return { success: true, user: userWithoutPassword };
  }, {
    body: t.Object({
      username: t.String(),
    })
  })
  .post('/getUserFromID', async ({ body, user, error }) => {
    if (error || !user) {
      return error;
    }

    const userId = body.userId;
    const foundUser = await UserModel.findOne({ id: userId });
    if (!foundUser) return { success: false, message: 'Invalid Token' };

    const { password, ...userWithoutPassword } = foundUser;
    return { success: true, user: userWithoutPassword };
  }, {
    body: t.Object({
      userId: t.String(),
    })
  });
