import user from "models/user";
import password from "models/password";
import { NotFoundError, UnauthorizedError } from "infra/errors";

async function getAuthenticatedUser(providerEmail, providerPassword) {
  try {
    const storedUser = await findOneByEmail(providerEmail);
    await validatePassword(providerPassword, storedUser.password);

    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Authentication data does not match",
        action: "Check if the data sent is correct",
        cause: error,
      });
    }
    throw error;
  }

  async function findOneByEmail(providerEmail) {
    try {
      const storedUser = await user.findOneByEmail(providerEmail);
      return storedUser;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "Email does not match",
          action: "Check if this data is correct",
        });
      }

      throw error;
    }
  }

  async function validatePassword(providerPassword, storedPassword) {
    const correctPasswordMatch = await password.compare(
      providerPassword,
      storedPassword,
    );

    if (!correctPasswordMatch) {
      throw new UnauthorizedError({
        message: "Password does not match",
        action: "Check if this data is correct",
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
