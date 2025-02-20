import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";
import { ServiceError } from "infra/errors";

async function runnerMigration(migrationOptions = {}) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      dryRun: true,
      dir: resolve("infra", "migrations"),
      direction: "up",
      log: () => {},
      migrationsTable: "pgmigrations",
      dbClient,
      ...migrationOptions,
    });
    return pendingMigrations;
  } catch (error) {
    throw new ServiceError({
      message: "Error running the migrations",
      cause: error,
    });
  } finally {
    await dbClient?.end();
  }
}

async function listPendingMigrations() {
  return runnerMigration({ dryRun: true });
}
async function runPendingMigrations() {
  return runnerMigration({ dryRun: false });
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
