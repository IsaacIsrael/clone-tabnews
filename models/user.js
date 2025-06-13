import database from "infra/database";
import password from "models/password";
import { ValidationError, NotFoundError } from "infra/errors";

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);
  return userFound;

  async function runSelectQuery(username) {
    const result = await database.query({
      text: `
      SELECT
        *
      FROM 
        users
      WHERE
        LOWER(username) = LOWER($1)
      LIMIT 
        1
    `,
      values: [username],
    });
    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "The informed user was not found in the system",
        action: "Check if the username is typed correctly",
      });
    }
    return result.rows[0];
  }
}

async function findOneByEmail(email) {
  const userFound = await runSelectQuery(email);
  return userFound;

  async function runSelectQuery(email) {
    const result = await database.query({
      text: `
      SELECT
        *
      FROM 
        users
      WHERE
        LOWER(email) = LOWER($1)
      LIMIT 
        1
    `,
      values: [email],
    });
    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "The informed user was not found in the system",
        action: "Check if the username is typed correctly",
      });
    }
    return result.rows[0];
  }
}

async function create(userInputValues) {
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueUsername(userInputValues.username);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInsertQuerry(userInputValues);
  return newUser;

  async function runInsertQuerry(userInputValues) {
    const result = await database.query({
      text: `
      INSERT INTO 
        users (username, email, password) 
      VALUES 
        ($1, $2, $3)
      RETURNING
        *
    `,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });
    return result.rows[0];
  }
}

async function update(username, userInputValues) {
  const currentUser = await findOneByUsername(username);

  if ("username" in userInputValues) {
    await validateUniqueUsername(userInputValues.username);
  }

  if ("email" in userInputValues) {
    await validateUniqueEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const userWithNewValues = {
    ...currentUser,
    ...userInputValues,
  };

  const updatedUser = await runUpdateQuerry(userWithNewValues);
  return updatedUser;

  async function runUpdateQuerry(userInputValues) {
    const result = await database.query({
      text: `
      UPDATE
        users
      SET
        username = $2,
        email = $3,
        password = $4,
        updated_at = timezone('utc', now())
      WHERE
        id = $1
      RETURNING
        *
    `,
      values: [
        userInputValues.id,
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });
    return result.rows[0];
  }
}

async function validateUniqueUsername(username) {
  const result = await database.query({
    text: `
    SELECT
      username
    FROM 
      users
    WHERE
      LOWER(username) = LOWER($1)
  `,
    values: [username],
  });
  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "This username is not avalible",
      action: "Use another username to perform this operation",
    });
  }
}

async function validateUniqueEmail(email) {
  const result = await database.query({
    text: `
    SELECT
      email
    FROM 
      users
    WHERE
      LOWER(email) = LOWER($1)
  `,
    values: [email],
  });
  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "This email is not avalible",
      action: "Use another email to perform this operation.",
    });
  }
}

async function hashPasswordInObject(userInputValues) {
  const hashPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashPassword;
}

const user = {
  create,
  update,
  findOneByUsername,
  findOneByEmail,
};

export default user;
