import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

/** Hash a password with scrypt. Format: `scrypt$<salt-hex>$<hash-hex>`. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

/** Constant-time verification of a password against a stored hash. */
export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;

  const [, salt, hash] = parts;
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== KEY_LENGTH) return false;

  try {
    const derived = scryptSync(password, salt, KEY_LENGTH);
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}
