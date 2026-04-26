import webserver from "infra/webserver";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Retrieving pending migrations", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/migrations`);

      expect(response.status).toBe(403);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "User do not have permission to perform this action.",
        action: "Check user permissions has a feature read:migration.",
        status_code: 403,
      });
    });
  });
  describe("Default user", () => {
    test("Retrieving pending migrations", async () => {
      const createdUser = await orchestrator.createActivatedUser();
      const sessionObject = await orchestrator.createSession(createdUser);
      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(403);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "User do not have permission to perform this action.",
        action: "Check user permissions has a feature read:migration.",
        status_code: 403,
      });
    });
  });
  describe("Privileged user", () => {
    test("With `read:migration` permission", async () => {
      const createdUser = await orchestrator.createActivatedUser();
      await orchestrator.addFeaturesToUser(createdUser, ["read:migration"]);
      const sessionObject = await orchestrator.createSession(createdUser);
      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toBe(true);
    });
  });
});
