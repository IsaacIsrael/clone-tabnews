test("GET to /api/v1/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);

  const responseBody = await response.json();
  expect(responseBody.update_at).toBeDefined();

  const parseUpdateAt = new Date(responseBody.update_at).toISOString();
  expect(responseBody.update_at).toBe(parseUpdateAt);

  expect(responseBody.dependencies).toBeDefined();
  expect(responseBody.dependencies.database).toBeDefined();
  expect(responseBody.dependencies.database.version).toBeDefined();
  expect(responseBody.dependencies.database.version).toBe("16.0");
  expect(responseBody.dependencies.database.max_connections).toBeDefined();
  expect(responseBody.dependencies.database.max_connections).toBe(100);
  expect(responseBody.dependencies.database.active_connections).toBeDefined();
  expect(responseBody.dependencies.database.active_connections).toBe(1);
});
