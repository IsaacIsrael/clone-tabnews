import orchestrator from "test/orchestrator";

beforeAll(async () => {
  await orchestrator.waitAllServices();
});

describe("DELETE /api/v1/status", () => {
  describe("Anonymos user", () => {
    test("Delete pedding migrations", async () => {
      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "DELETE",
      });
      expect(response.status).toBe(405);

      const responseBody = await response.json();

      expect(responseBody.name).toBeDefined();
      expect(responseBody.name).toBe("MethodNotAllowedError");
      expect(responseBody.message).toBeDefined();
      expect(responseBody.message).toBe(
        "Method is not allowed for this endpoint",
      );
      expect(responseBody.action).toBeDefined();
      expect(responseBody.action).toBe(
        "Check if this HTTP Method send is valid for this endpoint",
      );
      expect(responseBody.status_code).toBeDefined();
      expect(responseBody.status_code).toBe(405);
    });
  });
});
