// Script para sincronizar el esquema SQL con Turso automáticamente y sembrar datos iniciales
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

// Clean wrapping quotes if pasted with quotes
url = url.trim().replace(/^["']|["']$/g, "");
if (authToken) {
  authToken = authToken.trim().replace(/^["']|["']$/g, "");
}

console.log(`🔌 Conectando a Turso: ${url.replace(/:[^@]+@/, ":****@")} ...`);

const client = createClient({ url, authToken });
const sqlPath = path.join(root, "prisma", "schema.sql");
let rawSql = fs.readFileSync(sqlPath, "utf-8");

// Strip UTF-8 BOM if present
rawSql = rawSql.replace(/^\uFEFF/, "");

// Remove line comments and split into individual statements
const cleanSql = rawSql.replace(/--.*$/gm, "");
const statements = cleanSql
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

console.log(`📦 Aplicando ${statements.length} sentencias DDL en Turso...`);

for (const stmt of statements) {
  try {
    await client.execute(stmt);
  } catch (error) {
    const msg = error?.message || String(error);
    if (msg.includes("already exists") || msg.includes("duplicate")) {
      continue;
    }
    console.warn(`⚠️ Advertencia en sentencia (${stmt.slice(0, 35)}...): ${msg}`);
  }
}

// Sembrar datos iniciales de forma idempotente
try {
  // 1. Settings singleton
  await client.execute(`
    INSERT OR IGNORE INTO "Settings" ("id", "businessName", "tagline", "timezone", "currency", "slotStepMin", "bufferMin", "minLeadHours", "maxAdvanceDays")
    VALUES ('singleton', 'Estudio Nube', 'Turnos de belleza sin vueltas', 'America/Bogota', 'COP', 15, 10, 2, 180)
  `);

  // 2. Admin user
  await client.execute(`
    INSERT OR IGNORE INTO "User" ("id", "email", "name", "passwordHash", "role")
    VALUES (
      'admin-default-id',
      'admin@estudio.local',
      'Administración',
      'scrypt$738b55d78709f1bf32c525f69661f00b$2c58c2794eb090449cf848a6cbcc86a9bc289b43aa1f629fa2a88448ecdb231ae35f3dfd59fa8c130384795e2c7a52bb9e5fe91f63e6e3923d6a9a08a2ff5b49',
      'ADMIN'
    )
  `);

  // 3. Servicios y Personal
  const servicesRes = await client.execute('SELECT count(*) as count FROM "Service"');
  const count = Number(servicesRes.rows[0]?.count ?? 0);
  if (count === 0) {
    console.log("🌱 Sembrando servicios y profesionales iniciales...");
    await client.execute(`
      INSERT OR IGNORE INTO "Service" ("id", "name", "description", "durationMin", "priceCents", "color", "isActive", "sortOrder")
      VALUES 
      ('srv-1', 'Corte de pelo & Styling', 'Diagnóstico capilar, lavado premium y peinado final.', 45, 1200000, '#8b5cf6', 1, 1),
      ('srv-2', 'Color & Mechas', 'Coloración completa y tratamiento hidratante.', 90, 3500000, '#db2777', 1, 2),
      ('srv-3', 'Manicura Rusa / Kapping', 'Limpieza profunda de cutículas y esmaltado semipermanente.', 60, 1500000, '#0ea5e9', 1, 3)
    `);

    await client.execute(`
      INSERT OR IGNORE INTO "StaffMember" ("id", "name", "color", "isActive")
      VALUES 
      ('stf-1', 'Lucas García', '#18181b', 1),
      ('stf-2', 'Valentina Sol', '#db2777', 1)
    `);

    await client.execute(`
      INSERT OR IGNORE INTO "_ServiceToStaffMember" ("A", "B")
      VALUES 
      ('srv-1', 'stf-1'),
      ('srv-2', 'stf-1'),
      ('srv-2', 'stf-2'),
      ('srv-3', 'stf-2')
    `);

    for (const stfId of ['stf-1', 'stf-2']) {
      for (let wd = 1; wd <= 6; wd++) {
        await client.execute({
          sql: `INSERT OR IGNORE INTO "WorkingHours" ("id", "staffId", "weekday", "startMin", "endMin", "isClosed")
                VALUES (?, ?, ?, ?, ?, 0)`,
          args: [`wh-${stfId}-${wd}`, stfId, wd, 9 * 60, 19 * 60]
        });
      }
    }
  }
} catch (seedErr) {
  console.warn("⚠️ Aviso al sembrar datos (puede que ya existan):", seedErr?.message || seedErr);
}

console.log("✅ ¡Esquema y datos sincronizados exitosamente en Turso!");
