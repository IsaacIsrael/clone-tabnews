import crypto from "node:crypto";
import database from "infra/database";
import { UnauthorizedError } from "infra/errors";

const EXPIRATION_IN_MILISECONS = 60 * 60 * 24 * 30 * 1000; // 30 days

function getExpiresAt() {
  return new Date(Date.now() + EXPIRATION_IN_MILISECONS);
}

async function findOneValidByToken(sessionToken) {
  const sessionFound = await runSelectQuery(sessionToken);
  return sessionFound;

  async function runSelectQuery(sessionToken) {
    const result = await database.query({
      text: `
        SELECT
          *
        FROM
          sessions
        WHERE
          token = $1 
          AND expires_at > NOW()
        LIMIT 
          1
      ;`,
      values: [sessionToken],
    });
    if (result.rowCount === 0) {
      throw new UnauthorizedError({
        message: "User do not have a valid session.",
        action: "Check if user is logged in and try again.",
      });
    }
    return result.rows[0];
  }
}

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = getExpiresAt();
  const newSession = await runInsertQuery(token, userId, expiresAt);
  return newSession;

  async function runInsertQuery(token, userId, expiresAt) {
    const result = await database.query({
      text: `
        INSERT INTO
          sessions (token, user_id, expires_at)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
      ;`,
      values: [token, userId, expiresAt],
    });
    return result.rows[0];
  }
}

async function renew(sessionId) {
  const expiresAt = getExpiresAt();
  const renewedSessionObject = await runUpdateQuery(sessionId, expiresAt);
  return renewedSessionObject;

  async function runUpdateQuery(sessionId, expiresAt) {
    const result = await database.query({
      text: `
        UPDATE 
          sessions 
        SET
          expires_at = $1,
          updated_at = NOW()
        WHERE
          id = $2
        RETURNING
          *
      ;`,
      values: [expiresAt, sessionId],
    });
    return result.rows[0];
  }
}

const session = {
  create,
  findOneValidByToken,
  EXPIRATION_IN_MILISECONS,
  renew,
};

export default session;
