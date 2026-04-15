import { Elysia, t } from "elysia";
import { usersService } from "../services/users.service";

export const usersRoute = new Elysia({ prefix: "/api/users" })
  .post("/", async ({ body, set }) => {
    try {
      const newUser = await usersService.registerUser(body);
      
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
  })
  .post("/login", async ({ body, set }) => {
    try {
      const { email, password } = body;
      const token = await usersService.loginUser({ email, password });
      
      return {
        data: token
      };
    } catch (error: any) {
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
  .group("", (app) =>
    app
      .derive(({ headers, set }) => {
        const authHeader = headers["authorization"];

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          set.status = 401;
          throw new Error("Unauthorized");
        }

        const token = authHeader.split(" ")[1];

        // Validasi format UUID (8-4-4-4-12 hex)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(token)) {
          set.status = 401;
          throw new Error("Unauthorized");
        }

        return { token };
      })
      .onError(({ error, set }) => {
        if (error.message === "Unauthorized") {
          set.status = 401;
          return { error: "Unauthorized" };
        }
      })
      .get("/current", async ({ token }) => {
        try {
          const user = await usersService.getCurrentUser(token);

          return {
            data: user,
          };
        } catch (error) {
          throw error;
        }
      })
      .delete("/logout", async ({ token }) => {
        try {
          await usersService.logoutUser(token);

          return {
            data: "OK!",
          };
        } catch (error) {
          throw error;
        }
      })
  );
