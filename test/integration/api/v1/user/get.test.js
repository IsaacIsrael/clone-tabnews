import { version as uuidVersion } from "uuid";
import setCookieParser from "set-cookie-parser";

import orchestrator from "test/orchestrator";
import session from "models/session";

beforeAll(async () => {
  await orchestrator.waitAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/user", () => {
  describe("Default user", () => {
    test("With valid session", async () => {
      const createdUser = await orchestrator.createUser({
        username: "UserWithValidSession",
      });
      const sessionObject = await orchestrator.createSession(createdUser.id);
      const response = await fetch(`http://localhost:3000/api/v1/user`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      const responseBody = await response.json();
      const caheControl = response.headers.get("Cache-Control");

      expect(response.status).toBe(200);
      expect(caheControl).toBe(
        "no-store, no-cache, max-age=0, must-revalidate",
      );
      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "UserWithValidSession",
        email: createdUser.email,
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      // Session renewal assertions
      const renewedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );

      expect(
        renewedSessionObject.updated_at > sessionObject.updated_at,
      ).toEqual(true);

      expect(
        renewedSessionObject.expires_at > sessionObject.expires_at,
      ).toEqual(true);

      const expiresAt = new Date(renewedSessionObject.expires_at);
      const updatedAt = new Date(renewedSessionObject.updated_at);
      expiresAt.setMilliseconds(0);
      updatedAt.setMilliseconds(0);
      expect(expiresAt - updatedAt).toEqual(session.EXPIRATION_IN_MILISECONS);

      // Set-cookie header assertions
      const parsedCookie = setCookieParser(response, { map: true });
      expect(parsedCookie.session_id).toEqual({
        name: "session_id",
        httpOnly: true,
        path: "/",
        maxAge: session.EXPIRATION_IN_MILISECONS / 1000,
        value: renewedSessionObject.token,
      });
    });

    test("With nonexistent session", async () => {
      const nonexistentToken =
        "244a21939f3a3f0ee61648792da0819d0b0bef15a8909ecf1c096b49ed728833a9ce5c831caa7cf8a977e463616d7db6";

      const response = await fetch(`http://localhost:3000/api/v1/user`, {
        headers: {
          Cookie: `session_id=${nonexistentToken}`,
        },
      });

      const responseBody = await response.json();
      expect(response.status).toBe(401);
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "User do not have a valid session.",
        action: "Check if user is logged in and try again.",
        status_code: 401,
      });

      // Set-Cookie assertions

      const parsedCookie = setCookieParser(response, { map: true });
      expect(parsedCookie.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        maxAge: -1,
        path: "/",
        httpOnly: true,
      });
    });

    test("With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILISECONS),
      });

      const createdUser = await orchestrator.createUser({
        username: "UserWithExpiredSession",
      });
      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch(`http://localhost:3000/api/v1/user`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      const responseBody = await response.json();
      expect(response.status).toBe(401);
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "User do not have a valid session.",
        action: "Check if user is logged in and try again.",
        status_code: 401,
      });

      // Set-Cookie assertions

      const parsedCookie = setCookieParser(response, { map: true });
      expect(parsedCookie.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        maxAge: -1,
        path: "/",
        httpOnly: true,
      });
    });

    test("With valid session about to expire", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILISECONS + 100),
      });

      const createdUser = await orchestrator.createUser({
        username: "UserWithAboutToExpireSession",
      });
      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch(`http://localhost:3000/api/v1/user`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "UserWithAboutToExpireSession",
        email: createdUser.email,
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      // Session renewal assertions
      const renewedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );

      expect(
        renewedSessionObject.updated_at > sessionObject.updated_at,
      ).toEqual(true);

      expect(
        renewedSessionObject.expires_at > sessionObject.expires_at,
      ).toEqual(true);

      const expiresAt = new Date(renewedSessionObject.expires_at);
      const updatedAt = new Date(renewedSessionObject.updated_at);
      expiresAt.setMilliseconds(0);
      updatedAt.setMilliseconds(0);
      expect(expiresAt - updatedAt).toEqual(session.EXPIRATION_IN_MILISECONS);

      // Set-cookie header assertions
      const parsedCookie = setCookieParser(response, { map: true });
      expect(parsedCookie.session_id).toEqual({
        name: "session_id",
        httpOnly: true,
        path: "/",
        maxAge: session.EXPIRATION_IN_MILISECONS / 1000,
        value: renewedSessionObject.token,
      });
    });
  });
});
