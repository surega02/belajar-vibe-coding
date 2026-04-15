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
  })
  .get("/current", async ({ headers, set }) => {
    try {
      const authHeader = headers['authorization'];
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const token = authHeader.split(' ')[1];
      const user = await usersService.getCurrentUser(token);

      return {
        data: user
      };
    } catch (error) {
      set.status = 401;
      return {
        error: "Unauthorized"
      };
    }
  });
