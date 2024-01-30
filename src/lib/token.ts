import crypto from "crypto";
import { env } from "../env";

export const createToken = (userId: number) => {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(env.AES_256_SECRET, "hex"),
    Buffer.from(env.AES_IV, "hex"),
  );
  let encrypted = cipher.update(JSON.stringify({ userId }), "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

export const verifyToken = (token: string) => {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(env.AES_256_SECRET, "hex"),
    Buffer.from(env.AES_IV, "hex"),
  );
  let decrypted = decipher.update(token, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted) as { userId: number };
};
