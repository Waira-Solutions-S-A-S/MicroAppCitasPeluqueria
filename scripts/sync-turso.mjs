// Script para sincronizar el esquema SQL con Turso automáticamente
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, "..");

let url = process.env.TURSO_DATABASE_URL;
let authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.log("ℹ️ No TURSO_DATABASE_URL defined, skipping Turso schema sync.");
  process.exit(0);
}

// Clean wrapping quotes if pasted with quotes (e.g. from .env files)
url = url.trim().replace(/^["']|["']$/g, "");
if (authToken) {
  authToken = authToken.trim().replace(/^["']|["']$/g, "");
}

console.log(`🔌 Conectando a Turso: ${url.replace(/:[^@]+@/, ":****@")} ...`);

const client = createClient({ url, authToken });
const sqlPath = path.join(root, "prisma", "schema.sql");
const rawSql = fs.readFileSync(sqlPath, "utf-8");

// Remove line comments and split into individual statements
const cleanSql = rawSql.replace(/--.*$/gm, "");
const statements = cleanSql
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

console.log(`📦 Aplicando ${statements.length} sentencias SQL en Turso...`);

for (const stmt of statements) {
  try {
    await client.execute(stmt);
  } catch (error) {
    const msg = error?.message || String(error);
    if (msg.includes("already exists") || msg.includes("duplicate")) {
      // Safe to ignore for idempotent DDL
      continue;
    }
    console.warn(`⚠️ Advertencia en sentencia (${stmt.slice(0, 35)}...): ${msg}`);
  }
}

console.log("✅ ¡Esquema sincronizado exitosamente en Turso!");
