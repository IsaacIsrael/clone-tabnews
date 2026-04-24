import webserver from "infra/webserver";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/status`);
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody.updated_at).toBeDefined();

      const parseUpdateAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toBe(parseUpdateAt);

      expect(responseBody.dependencies).toBeDefined();
      expect(responseBody.dependencies.database).toBeDefined();
      expect(responseBody.dependencies.database.max_connections).toBeDefined();
      expect(responseBody.dependencies.database.max_connections).toBe(100);
      expect(
        responseBody.dependencies.database.opened_connections,
      ).toBeDefined();
      expect(responseBody.dependencies.database.opened_connections).toBe(1);
      expect(responseBody.dependencies.database).not.toHaveProperty("version");
    });
  });

  describe("Default user", () => {
    test("Retrieving current system status", async () => {
      const createdUser = await orchestrator.createActivatedUser();
      const sessionObject = await orchestrator.createSession(createdUser);
      const response = await fetch(`${webserver.origin}/api/v1/status`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody.updated_at).toBeDefined();

      const parseUpdateAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toBe(parseUpdateAt);

      expect(responseBody.dependencies).toBeDefined();
      expect(responseBody.dependencies.database).toBeDefined();
      expect(responseBody.dependencies.database.max_connections).toBeDefined();
      expect(responseBody.dependencies.database.max_connections).toBe(100);
      expect(
        responseBody.dependencies.database.opened_connections,
      ).toBeDefined();
      expect(responseBody.dependencies.database.opened_connections).toBe(1);
      expect(responseBody.dependencies.database).not.toHaveProperty("version");
    });
  });

  describe("Privileged user", () => {
    test("With `read:status:all` permission", async () => {
      const createdUser = await orchestrator.createActivatedUser();
      await orchestrator.addFeaturesToUser(createdUser, ["read:status:all"]);
      const sessionObject = await orchestrator.createSession(createdUser);
      const response = await fetch(`${webserver.origin}/api/v1/status`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody.updated_at).toBeDefined();

      const parseUpdateAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toBe(parseUpdateAt);

      expect(responseBody.dependencies).toBeDefined();
      expect(responseBody.dependencies.database).toBeDefined();
      expect(responseBody.dependencies.database.version).toBeDefined();
      expect(responseBody.dependencies.database.version).toBe("16.0");
      expect(responseBody.dependencies.database.max_connections).toBeDefined();
      expect(responseBody.dependencies.database.max_connections).toBe(100);
      expect(
        responseBody.dependencies.database.opened_connections,
      ).toBeDefined();
      expect(responseBody.dependencies.database.opened_connections).toBe(1);
    });
  });
});
