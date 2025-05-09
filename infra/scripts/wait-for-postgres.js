const { exec } = require("node:child_process");
const loader = require("./loader.js");

function checkPostgres() {
  function handleReturn(error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      return checkPostgres();
    }
    loader.stopLoader();
    console.log("🟢 Postgres esta aceitando conexões.\n");
  }

  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);
}
loader.startLoader({
  text: "🔴 Aguardando o postgres aceitar conexõe",
});
checkPostgres();
