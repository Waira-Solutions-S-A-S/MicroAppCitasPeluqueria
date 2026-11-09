// Script para sincronizar el esquema SQL con Turso automáticamente
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, "..");

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.log("ℹ️ No TURSO_DATABASE_URL defined, skipping Turso schema sync.");
  process.exit(0);
}

console.log(`🔌 Conectando a Turso: ${url.replace(/:[^@]+@/, ":****@")} ...`);

const client = createClient({ url, authToken });
const sqlPath = path.join(root, "prisma", "schema.sql");
const sql = fs.readFileSync(sqlPath, "utf-8");

try {
  console.log(" Aplicando esquema de base de datos...");
  await client.executeMultiple(sql);
  console.log(" ¡Esquema sincronizado exitosamente en Turso!");
} catch (error) {
  console.error(" Error al aplicar esquema en Turso:", error);
  process.exit(1);
}
