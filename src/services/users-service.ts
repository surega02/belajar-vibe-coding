import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, sessions } from "../db/schema";

export const usersService = {
  loginUser: async ({ email, password }) => {
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
