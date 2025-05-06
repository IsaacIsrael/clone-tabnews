import { version as uuidVersion } from "uuid";
import orchestrator from "test/orchestrator";
import user from "models/user";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymos user", () => {
    test("With unique and valide data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "isaacisrael",
          email: "isaac@test.com",
          password: "senha123",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(201);
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "isaacisrael",
        email: "isaac@test.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userInDatBase = await user.findOneByUsername(responseBody.username);
      const correctPasswordMatch = await password.compare(
        "senha123",
        userInDatBase.password,
      );
      expect(correctPasswordMatch).toBe(true);

      const incorrectPasswordMatch = await password.compare(
        "incorrectPassword",
        userInDatBase.password,
      );
      expect(incorrectPasswordMatch).toBe(false);
    });

    test("With duplicated 'email'", async () => {
      await orchestrator.createuser({
        email: "duplicatedEmail@test.com",
      });

      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicatedEmail",
          email: "DuplicatedEmail@test.com",
          password: "senha123",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "This email is not avalible",
        action: "Use another email to perform this operation.",
        status_code: 400,
      });
    });

    test("With duplicated 'username'", async () => {
      await orchestrator.createuser({
        username: "duplicatedUsername",
      });

      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "DuplicatedUsername",
          email: "duplicatedUsername2@test.com",
          password: "senha123",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "This username is not avalible",
        action: "Use another username to perform this operation",
        status_code: 400,
      });
    });
  });
});
