import { faker } from "@faker-js/faker";
import retry from "async-retry";
import database from "infra/database";
import webserver from "infra/webserver";
import activation from "models/activation";
import migrator from "models/migrator";
import session from "models/session";
import user from "models/user";

const emailHttpUrl = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function waitAllServices() {
  await waitForWebServices();
  await waitForEmailServices();

  async function waitForWebServices() {
    return retry(fetchStatusPage, { retries: 100, maxTimeout: 1000 });

    async function fetchStatusPage() {
      const response = await fetch(`${webserver.origin}/api/v1/status`);
      if (response.status !== 200) {
        throw Error();
      }
    }
  }

  async function waitForEmailServices() {
    return retry(fetchEmailPage, { retries: 100, maxTimeout: 1000 });

    async function fetchEmailPage() {
      const response = await fetch(emailHttpUrl);
      if (response.status !== 200) {
        throw Error();
      }
    }
  }
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userObject) {
  return user.create({
    username:
      userObject?.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: userObject?.email || faker.internet.email(),
    password: userObject?.password || faker.internet.password({ length: 12 }),
  });
}

async function activateUser(inactiveUser) {
  return await activation.activateUserByUserId(inactiveUser.id);
}

async function createActivatedUser(userObject) {
  const inactiveUser = await createUser(userObject);
  return await activateUser(inactiveUser);
}

async function createSession(userObject) {
  return session.create(userObject.id);
}

async function addFeaturesToUser(userObject, features) {
  const updatedUser = await user.addFeatures(userObject.id, features);
  return updatedUser;
}

async function deleteAllEmails() {
  await fetch(`${emailHttpUrl}/messages`, { method: "DELETE" });
}

async function getLastEmail() {
  const emailListResponse = await fetch(`${emailHttpUrl}/messages`);
  const emailListResponseBody = await emailListResponse.json();
  const lastEmailItem = emailListResponseBody.pop();

  if (!lastEmailItem) {
    return null;
  }

  const emailTextResponse = await fetch(
    `${emailHttpUrl}/messages/${lastEmailItem.id}.plain`,
  );
  const emailTextBody = await emailTextResponse.text();

  lastEmailItem.text = emailTextBody;
  return lastEmailItem;
}

function extractUUID(text) {
  const match = text.match(
    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/,
  );
  return match ? match[0] : null;
}

const orchestrator = {
  waitAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
  createSession,
  deleteAllEmails,
  getLastEmail,
  extractUUID,
  activateUser,
  createActivatedUser,
  addFeaturesToUser,
};

export default orchestrator;
