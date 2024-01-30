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
  AES_256_SECRET: z
    .string()
    .optional()
    .default(
      "05dcbf62ad1d09709cc237cdb4ea27706c8b756696d14ab656cc8ff202e620d1",
    ),
  AES_IV: z.string().optional().default("3906e771376653aee09f30039ac3f781"),
});

export const env = envSchema.parse(process.env);
