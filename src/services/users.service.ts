import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, sessions } from "../db/schema";

export const usersService = {
  async registerUser(data: { name: string; email: string; password: string }) {
    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("Email sudah terdaftar");
    }

    // Hash password using Bun.password
    const hashedPassword = await Bun.password.hash(data.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    // Create user
    const [result] = await db.insert(users).values({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    // Fetch created user (MySQL might need a select to get timestamps correctly)
    const newUser = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, result.insertId))
      .limit(1);

    return newUser[0];
  },

  loginUser: async ({ email, password }: any) => {
    // 1. Cari user berdasarkan email
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      throw new Error("Email atau password salah");
    }

    // 2. Verifikasi kata sandi (Password)
    const isPasswordValid = await Bun.password.verify(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Email atau password salah");
    }

    // 3. Pembuatan Session Token
    const token = crypto.randomUUID();

    // Simpan ke tabel sessions
    await db.insert(sessions).values({
      token: token,
      userId: user.id,
    });

    return token;
  },

  getCurrentUser: async (token: string) => {
    const [result] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.token, token))
      .limit(1);

    if (!result) {
      throw new Error("Unauthorized");
    }

    return result;
  },

  logoutUser: async (token: string) => {
    // Jalankan perintah DELETE pada tabel sessions
    const [result] = await db.delete(sessions).where(eq(sessions.token, token));

    // Periksa apakah ada baris yang terhapus
    if (result.affectedRows === 0) {
      throw new Error("Unauthorized");
    }

    return "OK!";
  },
};
