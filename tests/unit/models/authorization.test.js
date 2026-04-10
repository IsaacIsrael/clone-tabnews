import { InternalServerError } from "infra/errors";
import authorization from "models/authorization";

describe("models/authorization", () => {
  describe(".can()", () => {
    test("Without `user`", () => {
      expect(() => authorization.can()).toThrow(InternalServerError);
    });

    test("Without `user.features`", () => {
      const createdUser = {};
      expect(() => authorization.can(createdUser)).toThrow(InternalServerError);
    });

    test("With valid `user` and  unknown `feature`", () => {
      const createdUser = {
        features: [],
      };
      expect(() => authorization.can(createdUser, "unknown:feature")).toThrow(
        InternalServerError,
      );
    });

    test("With valid `user` and known `feature`", () => {
      const createdUser = {
        features: ["create:user"],
      };
      expect(authorization.can(createdUser, "create:user")).toBe(true);
    });
  });

  describe(".filterOutput()", () => {
    test("Without `user`", () => {
      expect(() => authorization.filterOutput()).toThrow(InternalServerError);
    });

    test("Without `user.features`", () => {
      const createdUser = {};
      expect(() => authorization.filterOutput(createdUser)).toThrow(
        InternalServerError,
      );
    });

    test("With valid `user` and unknown `feature`", () => {
      const createdUser = {
        features: [],
      };
      expect(() =>
        authorization.filterOutput(createdUser, "unknown:feature"),
      ).toThrow(InternalServerError);
    });

    test("With valid `user` and known `feature` but no `resource`", () => {
      const createdUser = {
        features: [],
      };
      expect(() =>
        authorization.filterOutput(createdUser, "unknown:feature"),
      ).toThrow(InternalServerError);
    });

    test("with valid `user`, and known `feature`  and `resource`", () => {
      const createdUser = {
        features: ["read:user"],
      };

      const resource = {
        id: 1,
        username: "resource",
        features: ["read:user"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email: "resource@example.com",
        password: "resource",
      };

      const results = authorization.filterOutput(
        createdUser,
        "read:user",
        resource,
      );

      expect(results).toEqual({
        id: resource.id,
        username: resource.username,
        features: resource.features,
        created_at: resource.created_at,
        updated_at: resource.updated_at,
      });
    });
  });
});
