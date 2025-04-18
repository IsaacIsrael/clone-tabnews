import bcrypt from "bcryptjs";

async function hash(password) {
  const rounds = getNumberOfRound();
  return await bcrypt.hash(password, rounds);
}

function getNumberOfRound() {
  let rounds = 1;

  if (process.env.NODE_ENV === "production") {
    rounds = 14;
  }

  return rounds;
}

async function compare(providerPassword, storePassword) {
  return bcrypt.compare(providerPassword, storePassword);
}

const password = {
  hash,
  compare,
};

export default password;
