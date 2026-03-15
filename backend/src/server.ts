import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./db/prisma";

async function start(): Promise<void> {
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((error) => {
  console.error("Failed to start API", error);
  process.exitCode = 1;
});
