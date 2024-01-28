import { z } from "zod";

// Define the schema as an object with all of the env
// variables and their types
const envSchema = z.object({
  NODE_ENV: z
    .union([
      z.literal("development"),
      z.literal("test"),
      z.literal("production"),
    ])
    .default("development"),
  POSTGRES_DB: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_HOST: z.string(),
});

export const env = envSchema.parse(process.env);
