import { Elysia, t } from "elysia";
import { usersService } from "../services/users-service";

export const usersRoute = new Elysia({ prefix: "/api/users" })
  .post("/login", async ({ body, set }) => {
    try {
      const { email, password } = body;
      const token = await usersService.loginUser({ email, password });
      
      return {
        data: token
      };
    } catch (error) {
      set.status = 401;
      return {
        error: error.message
      };
    }
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String()
    })
  });
