import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD, // Allow undefined if empty
    database: process.env.DB_NAME || "db_belajar_vibe_coding",
    port: Number(process.env.DB_PORT) || 3306,
  },
});
