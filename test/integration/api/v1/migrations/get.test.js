import orchestrator from "test/orchestrator";

beforeAll(async () => {
  await orchestrator.waitAllServices();
  await orchestrator.dropTables();
});

describe("GET /api/v1/migrations", () => {
  describe("Anonymos user", () => {
    test("Retrieving pedding migrations", async () => {
      const response = await fetch("http://localhost:3000/api/v1/migrations");
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toBe(true);
      expect(responseBody.length).toBeGreaterThan(0);
    });
  });
});
