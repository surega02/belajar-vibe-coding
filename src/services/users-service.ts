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
};
