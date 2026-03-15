import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required. Copy backend/.env.example to backend/.env and set values.",
  );
}

const pool = new Pool({ connectionString: databaseUrl });

export async function runSqlDirectory(relativeDir: string): Promise<void> {
  const directory = path.resolve(process.cwd(), relativeDir);
  const files = (await fs.readdir(directory))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log(`No SQL files found in ${directory}`);
    return;
  }

  const client = await pool.connect();
  try {
    for (const file of files) {
      const fullPath = path.join(directory, file);
      const sql = await fs.readFile(fullPath, "utf8");
      console.log(`Running ${file}`);
      await client.query(sql);
    }
  } finally {
    client.release();
    await pool.end();
  }
}
