import dotenv from "dotenv";
import { z } from "zod";

// 1. Load .env file into process.env
dotenv.config();

// 2. Define schema — add new env vars here as your project grows
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
});

// 3. Validate
const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Invalid environment variables:");
  result.error.issues.forEach((issue) => {
    console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = result.data;
