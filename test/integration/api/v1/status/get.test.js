import orchestrator from "test/orchestrator";

beforeAll(async () => {
  await orchestrator.waitAllServices();
});

describe("GET /api/v1/status", () => {
  describe("Anonymos user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status");
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
