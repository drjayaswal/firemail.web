import { createCipheriv, randomBytes, scryptSync } from "node:crypto";

const SALT = "fathommail-v1";

function getKeyBytes(): Buffer {
  const raw = process.env.MAIL_ENCRYPTION_KEY ?? process.env.AUTH_SECRET;
  if (!raw) {
    throw new Error("MAIL_ENCRYPTION_KEY or AUTH_SECRET is required for mail encryption");
  }
  return scryptSync(raw, SALT, 32);
}

export function encryptJsonPayload(payload: unknown): string {
  const key = getKeyBytes();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const plain = Buffer.from(JSON.stringify(payload), "utf8");
  const enc = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64url"), tag.toString("base64url"), enc.toString("base64url")].join(".");
}
