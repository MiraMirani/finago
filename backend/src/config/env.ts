import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

dotenv.config({ path: ".env.local", override: true });

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Environment variable validation failed");
}

export const env = parsed.data;
