import database from "infra/database";
import email from "infra/email";
import { NotFoundError } from "infra/errors";
import webserver from "infra/webserver";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutes

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const result = await database.query({
      text: `
      INSERT INTO
        user_activation_tokens (user_id, expires_at)
      VALUES
        ($1, $2)
      RETURNING
        *
    `,
      values: [userId, expiresAt],
    });
    return result.rows[0];
  }
}

async function findOneValidById(id) {
  const newToken = await runSelectQuery(id);
  return newToken;

  async function runSelectQuery(id) {
    const result = await database.query({
      text: `
      SELECT
        *
      FROM
        user_activation_tokens
      WHERE
        id = $1
        AND expires_at > NOW()
        AND used_at IS NULL
      LIMIT
        1
    `,
      values: [id],
    });

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "Activation token not found or is no longer valid.",
        action: "Try registering again.",
      });
    }

    return result.rows[0];
  }
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "InSystem <contato@insystem.com.br>",
    to: user.email,
    subject: "Activate you account at InSystem",
    text: `${user.username} welcome!
Please activate your account using the following link:

${webserver.origin}/registration/activate/${activationToken.id}

Best regards,
The InSystem Team
`,
  });
}

const activation = {
  findOneValidById,
  create,
  sendEmailToUser,
};
export default activation;
