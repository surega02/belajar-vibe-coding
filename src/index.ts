import { Elysia } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";
import { userRoute } from "./routes/user.route";
import { usersRoute } from "./routes/users-route";

const app = new Elysia()
  .use(userRoute)
  .use(usersRoute)
  .get("/", () => "Hello Elysia from Bun!")
  .get("/users", async () => {
    try {
      const result = await db.select().from(users);
      return result;
    } catch (error) {
      console.error(error);
      return { error: "Could not connect to database. Make sure your credentials in .env are correct." };
    }
  })
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
