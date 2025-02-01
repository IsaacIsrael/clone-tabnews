import database from "infra/database.js";
import { InternalServerError } from "infra/errors";

async function status(request, response) {
  try {
    const updateAt = new Date().toISOString();

    const dataBaseVersionResult = await database.query("SHOW server_version;");
    const dataBaseVersionValue = dataBaseVersionResult.rows[0].server_version;

    const databaseMaxConnectionsResult = await database.query(
      "SHOW max_connections;",
    );
    const databaseMaxConnectionsValue =
      databaseMaxConnectionsResult.rows[0].max_connections;

    const databaseName = process.env.POSTGRES_DB;
    const databaseOpenedConnectionsResult = await database.query({
      text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname=$1;",
      values: [databaseName],
    });
    const databaseOpenedConnectionsValue =
      databaseOpenedConnectionsResult.rows[0].count;

    response.status(200).json({
      updated_at: updateAt,
      dependencies: {
        database: {
          version: dataBaseVersionValue,
          max_connections: parseInt(databaseMaxConnectionsValue),
          opened_connections: databaseOpenedConnectionsValue,
        },
      },
    });
  } catch (error) {
    const puclicErrorObjcet = new InternalServerError({
      cause: error,
    });
    console.log("\n Error dentro fo catch do controller:");
    console.error(puclicErrorObjcet);
    response.status(500).json(puclicErrorObjcet);
  }
}

export default status;
