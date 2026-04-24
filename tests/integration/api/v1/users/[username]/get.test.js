import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";
import webserver from "infra/webserver";

beforeAll(async () => {
  await orchestrator.waitAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      const createdUser = await orchestrator.createUser({
        username: "SameCase",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${createdUser.username}`,
      );

      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual({
        id: createdUser.id,
        username: createdUser.username,
        features: createdUser.features,
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With case mismatch", async () => {
      const createdUser = await orchestrator.createUser({
        username: "DifferentCase",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/users/differentcase`,
      );

      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual({
        id: createdUser.id,
        username: createdUser.username,
        features: createdUser.features,
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With no existent `username`", async () => {
      const response = await fetch(
        `${webserver.origin}/api/v1/users/UsuarioQueNaoExiste`,
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
