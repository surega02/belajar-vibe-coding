import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export const userService = {
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
};
