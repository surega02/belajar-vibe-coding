import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, sessions } from "../db/schema";

export const usersService = {
  /**
   * Mendaftarkan pengguna baru ke dalam sistem.
   * Melakukan pengecekan email duplikat dan hashing password sebelum disimpan.
   * @param data - Objek berisi name, email, dan password.
   * @returns Data pengguna yang baru dibuat (tanpa password).
   */
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

  /**
   * Melakukan verifikasi kredensial pengguna dan membuat sesi baru.
   * @param data - Objek berisi email dan password.
   * @returns Session token (UUID) jika login berhasil.
   * @throws Error jika email tidak ditemukan atau password salah.
   */
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

  /**
   * Mengambil data profil pengguna berdasarkan session token yang valid.
   * @param token - Session token (UUID).
   * @returns Objek data user (id, name, email, createdAt).
   * @throws Error "Unauthorized" jika token tidak valid atau sesi tidak ditemukan.
   */
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

  /**
   * Menghapus sesi pengguna (logout) berdasarkan token yang diberikan.
   * @param token - Session token yang akan dihapus.
   * @returns String "OK!" jika berhasil.
   * @throws Error "Unauthorized" jika token tidak ditemukan.
   */
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
