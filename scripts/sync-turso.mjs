// Sincronizacion de esquema SQL y datos iniciales en Turso
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
  console.log("[turso] TURSO_DATABASE_URL no configurado, omitiendo sincronizacion.");
  process.exit(0);
}

// Limpiar comillas envolventes si provienen de variables de entorno formateadas
url = url.trim().replace(/^["']|["']$/g, "");
if (authToken) {
  authToken = authToken.trim().replace(/^["']|["']$/g, "");
}

console.log(`[turso] Conectando: ${url.replace(/:[^@]+@/, ":****@")}`);

const client = createClient({ url, authToken });
const sqlPath = path.join(root, "prisma", "schema.sql");
let rawSql = fs.readFileSync(sqlPath, "utf-8");

// Remover UTF-8 BOM si existe
rawSql = rawSql.replace(/^\uFEFF/, "");

// Eliminar comentarios de linea y separar en sentencias individuales
const cleanSql = rawSql.replace(/--.*$/gm, "");
const statements = cleanSql
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

console.log(`[turso] Aplicando ${statements.length} sentencias DDL...`);

for (const stmt of statements) {
  try {
    await client.execute(stmt);
  } catch (error) {
    const msg = error?.message || String(error);
    if (msg.includes("already exists") || msg.includes("duplicate")) {
      continue;
    }
    console.warn(`[turso] Advertencia en sentencia (${stmt.slice(0, 35)}...): ${msg}`);
  }
}

// Sembrar datos iniciales de forma idempotente
try {
  // 1. Settings singleton
  await client.execute(`
    INSERT OR IGNORE INTO "Settings" ("id", "businessName", "tagline", "timezone", "currency", "slotStepMin", "bufferMin", "minLeadHours", "maxAdvanceDays")
    VALUES ('singleton', 'Estudio Nube', 'Turnos de belleza sin vueltas', 'America/Bogota', 'COP', 15, 10, 2, 180)
  `);

  // 2. Admin user (con contrasena admin123 verificada con scrypt)
  await client.execute(`
    INSERT INTO "User" ("id", "email", "name", "passwordHash", "role")
    VALUES (
      'admin-default-id',
      'admin@estudio.local',
      'Administración',
      'scrypt$0b850f9782e1cfe7efda9668b5ea9cde$a5805626692d994d8e8a3de525fb775970193c2fb8a69661d9b57fbb7f19622df6eaccd8c75d61c6a15a8e4f03f201c71f8b678edd161b78b9ec2f743c61fee3',
      'ADMIN'
    )
    ON CONFLICT ("email") DO UPDATE SET "passwordHash" = excluded."passwordHash"
  `);

  // 3. Servicios y Personal
  const servicesRes = await client.execute('SELECT count(*) as count FROM "Service"');
  const count = Number(servicesRes.rows[0]?.count ?? 0);
  if (count === 0) {
    console.log("[turso] Sembrando servicios y profesionales iniciales...");
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
  console.warn("[turso] Aviso al sembrar datos:", seedErr?.message || seedErr);
}

console.log("[turso] Esquema y datos sincronizados correctamente.");
