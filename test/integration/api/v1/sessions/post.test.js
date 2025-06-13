import { version as uuidVersion } from "uuid";
import setCookieParser from "set-cookie-parser";
import orchestrator from "test/orchestrator";
import session from "models/session";

beforeAll(async () => {
  await orchestrator.waitAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/sessions", () => {
  describe("Anonymos user", () => {
    test("With incorrect `email` but correct `password`", async () => {
      await orchestrator.createUser({
        password: "correct-password",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "wrong.email@test.com",
          password: "correct-password",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Authentication data does not match",
        action: "Check if the data sent is correct",
        status_code: 401,
      });
    });

    test("With correct `email` but incorrect `password`", async () => {
      await orchestrator.createUser({
        email: "correct.email@test.com",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "correct.email@test.com",
          password: "incorrect-password",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Authentication data does not match",
        action: "Check if the data sent is correct",
        status_code: 401,
      });
    });

    test("With incorrect `email` but incorrect `password`", async () => {
      await orchestrator.createUser();

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "incorrect.email@test.com",
          password: "incorrect-password",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Authentication data does not match",
        action: "Check if the data sent is correct",
        status_code: 401,
      });
    });

    test("With correct `email` but correct `password`", async () => {
      const createdUser = await orchestrator.createUser({
        email: "all-correct.email@test.com",
        password: "all-correct-password",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "all-correct.email@test.com",
          password: "all-correct-password",
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        token: responseBody.token,
        user_id: createdUser.id,
        expires_at: responseBody.expires_at,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.expires_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const expiresAt = new Date(responseBody.expires_at);
      const createdAt = new Date(responseBody.created_at);
      expiresAt.setMilliseconds(0);
      createdAt.setMilliseconds(0);

      expect(expiresAt - createdAt).toEqual(session.EXPIRATION_IN_MILISECONS);

      const parsedCookie = setCookieParser(response, { map: true });
      expect(parsedCookie.session_id).toEqual({
        name: "session_id",
        httpOnly: true,
        path: "/",
        maxAge: session.EXPIRATION_IN_MILISECONS / 1000,
        value: responseBody.token,
      });
    });
  });
});
