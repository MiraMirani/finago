import { runSqlDirectory } from "./sqlRunner";

async function main(): Promise<void> {
  await runSqlDirectory("db/migrations");
  console.log("Migrations completed.");
}

main().catch((error) => {
  console.error("Migration failed", error);
  process.exitCode = 1;
});
