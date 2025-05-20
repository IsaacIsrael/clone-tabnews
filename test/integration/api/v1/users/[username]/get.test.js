import { version as uuidVersion } from "uuid";
import orchestrator from "test/orchestrator";

beforeAll(async () => {
  await orchestrator.waitAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymos user", () => {
    test("With exact case match", async () => {
      const createdUser = await orchestrator.createUser({
        username: "MesmoCase",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/MesmoCase`,
      );

      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "MesmoCase",
        email: createdUser.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With case mismatch", async () => {
      const createdUser = await orchestrator.createUser({
        username: "CaseDiferente",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/casediferente`,
      );

      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "CaseDiferente",
        email: createdUser.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With noexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioQueNaoExiste",
      );

      const responseBody = await response.json();

      expect(response.status).toBe(404);
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "The informed user was not found in the system",
        action: "Check if the username is typed correctly",
        status_code: 404,
      });
    });
  });
});
