import { runSqlDirectory } from "./sqlRunner";

async function main(): Promise<void> {
  await runSqlDirectory("db/seeds");
  console.log("Seed completed.");
}

main().catch((error) => {
  console.error("Seed failed", error);
  process.exitCode = 1;
});
