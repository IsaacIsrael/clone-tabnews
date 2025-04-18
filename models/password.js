import bcrypt from "bcryptjs";

async function hash(password) {
  const rounds = getNumberOfRound();
  return await bcrypt.hash(mixPepper(password), rounds);
}

function getNumberOfRound() {
  let rounds = 1;

  if (process.env.NODE_ENV === "production") {
    rounds = 14;
  }

  return rounds;
}

function mixPepper(password) {
  const pepper = process.env.PEPPER;
  const peperSize = Math.round(pepper.length / 2);

  const frontPepper = pepper.slice(0, peperSize);
  const backPepper = pepper.slice(peperSize, pepper.length);

  return frontPepper + password + backPepper;
}

async function compare(providerPassword, storePassword) {
  return bcrypt.compare(mixPepper(providerPassword), storePassword);
}

const password = {
  hash,
  compare,
};

export default password;
