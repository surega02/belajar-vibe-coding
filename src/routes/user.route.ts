import { Elysia, t } from "elysia";
import { userService } from "../services/user.service";

export const userRoute = new Elysia({ prefix: "/api/users" })
  .post("/", async ({ body, set }) => {
    try {
      const newUser = await userService.registerUser(body);
      
      return {
        message: "User created successfully",
        data: newUser
      };
    } catch (error: any) {
      if (error.message === "Email sudah terdaftar") {
        set.status = 400;
        return {
          message: error.message
        };
      }
      
      set.status = 500;
      return {
        message: "Internal Server Error",
        error: error.message
      };
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String({ format: 'email' }),
      password: t.String()
    })
  });
