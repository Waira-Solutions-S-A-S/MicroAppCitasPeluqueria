import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  let url = process.env.TURSO_DATABASE_URL;
  let authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    return NextResponse.json(
      {
        status: "error",
        message: "TURSO_DATABASE_URL no está configurado en las variables de entorno.",
      },
      { status: 500 }
    );
  }

  url = url.trim().replace(/^["']|["']$/g, "");
  if (authToken) {
    authToken = authToken.trim().replace(/^["']|["']$/g, "");
  }

  const client = createClient({ url, authToken });

  // Definición completa del esquema SQL
  const sqlStatements = [
    `CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "passwordHash" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'ADMIN',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "Service" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "durationMin" INTEGER NOT NULL,
      "priceCents" INTEGER NOT NULL DEFAULT 0,
      "color" TEXT NOT NULL DEFAULT '#8b5cf6',
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "StaffMember" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "color" TEXT NOT NULL DEFAULT '#0ea5e9',
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "WorkingHours" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "staffId" TEXT NOT NULL,
      "weekday" INTEGER NOT NULL,
      "startMin" INTEGER NOT NULL,
      "endMin" INTEGER NOT NULL,
      "isClosed" BOOLEAN NOT NULL DEFAULT false,
      CONSTRAINT "WorkingHours_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffMember" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "TimeOff" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "staffId" TEXT NOT NULL,
      "startAt" DATETIME NOT NULL,
      "endAt" DATETIME NOT NULL,
      "reason" TEXT,
      CONSTRAINT "TimeOff_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffMember" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "Appointment" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "serviceId" TEXT NOT NULL,
      "staffId" TEXT NOT NULL,
      "clientName" TEXT NOT NULL,
      "clientPhone" TEXT NOT NULL,
      "clientEmail" TEXT,
      "startAt" DATETIME NOT NULL,
      "endAt" DATETIME NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "notes" TEXT,
      "seriesId" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "Appointment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffMember" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "Appointment_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "RecurringSeries" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "RecurringSeries" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "intervalWeeks" INTEGER NOT NULL,
      "occurrences" INTEGER NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "Settings" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
      "businessName" TEXT NOT NULL DEFAULT 'Estudio Nube',
      "tagline" TEXT NOT NULL DEFAULT 'Turnos de belleza sin vueltas',
      "timezone" TEXT NOT NULL DEFAULT 'America/Bogota',
      "currency" TEXT NOT NULL DEFAULT 'COP',
      "slotStepMin" INTEGER NOT NULL DEFAULT 15,
      "bufferMin" INTEGER NOT NULL DEFAULT 10,
      "minLeadHours" INTEGER NOT NULL DEFAULT 2,
      "maxAdvanceDays" INTEGER NOT NULL DEFAULT 180
    )`,
    `CREATE TABLE IF NOT EXISTS "_ServiceToStaffMember" (
      "A" TEXT NOT NULL,
      "B" TEXT NOT NULL,
      CONSTRAINT "_ServiceToStaffMember_A_fkey" FOREIGN KEY ("A") REFERENCES "Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "_ServiceToStaffMember_B_fkey" FOREIGN KEY ("B") REFERENCES "StaffMember" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "WorkingHours_staffId_weekday_key" ON "WorkingHours"("staffId", "weekday")`,
    `CREATE INDEX IF NOT EXISTS "Appointment_staffId_startAt_idx" ON "Appointment"("staffId", "startAt")`,
    `CREATE INDEX IF NOT EXISTS "Appointment_startAt_idx" ON "Appointment"("startAt")`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "_ServiceToStaffMember_AB_unique" ON "_ServiceToStaffMember"("A", "B")`,
    `CREATE INDEX IF NOT EXISTS "_ServiceToStaffMember_B_index" ON "_ServiceToStaffMember"("B")`,
  ];

  const results: { sql: string; ok: boolean; error?: string }[] = [];

  for (const sql of sqlStatements) {
    try {
      await client.execute(sql);
      results.push({ sql: sql.slice(0, 40), ok: true });
    } catch (err: any) {
      results.push({ sql: sql.slice(0, 40), ok: false, error: err?.message });
    }
  }

  // Seed default Settings and Admin
  try {
    await prisma.settings.upsert({
      where: { id: "singleton" },
      update: {},
      create: {
        id: "singleton",
        businessName: "Estudio Nube",
        tagline: "Turnos de belleza sin vueltas",
        timezone: "America/Bogota",
        currency: "COP",
      },
    });

    const adminEmail = "admin@estudio.local";
    const passwordHash =
      "scrypt$0b850f9782e1cfe7efda9668b5ea9cde$a5805626692d994d8e8a3de525fb775970193c2fb8a69661d9b57fbb7f19622df6eaccd8c75d61c6a15a8e4f03f201c71f8b678edd161b78b9ec2f743c61fee3";
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { passwordHash },
      create: {
        email: adminEmail,
        name: "Administración",
        passwordHash,
      },
    });

    // Seed sample services if none exist
    const serviceCount = await prisma.service.count();
    if (serviceCount === 0) {
      const s1 = await prisma.service.create({
        data: {
          name: "Corte de pelo & Styling",
          description: "Diagnóstico capilar, lavado premium y peinado final.",
          durationMin: 45,
          priceCents: 1200000,
          color: "#8b5cf6",
          sortOrder: 1,
        },
      });
      const s2 = await prisma.service.create({
        data: {
          name: "Color & Mechas",
          description: "Coloración completa y tratamiento hidratante.",
          durationMin: 90,
          priceCents: 3500000,
          color: "#db2777",
          sortOrder: 2,
        },
      });
      const s3 = await prisma.service.create({
        data: {
          name: "Manicura Rusa / Kapping",
          description: "Limpieza profunda de cutículas y esmaltado semipermanente.",
          durationMin: 60,
          priceCents: 1500000,
          color: "#0ea5e9",
          sortOrder: 3,
        },
      });

      // Seed staff members
      const staff1 = await prisma.staffMember.create({
        data: {
          name: "Lucas García",
          color: "#18181b",
          services: { connect: [{ id: s1.id }, { id: s2.id }] },
        },
      });
      const staff2 = await prisma.staffMember.create({
        data: {
          name: "Valentina Sol",
          color: "#db2777",
          services: { connect: [{ id: s2.id }, { id: s3.id }] },
        },
      });

      // Default working hours Monday-Saturday 9-19
      for (const st of [staff1, staff2]) {
        for (let wd = 1; wd <= 6; wd++) {
          await prisma.workingHours.create({
            data: {
              staffId: st.id,
              weekday: wd,
              startMin: 9 * 60,
              endMin: 19 * 60,
              isClosed: false,
            },
          });
        }
      }
    }
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "schema_created_but_seed_error",
        results,
        seedError: err?.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    status: "ok",
    message: "Base de datos sincronizada y datos iniciales sembrados correctamente.",
    results,
  });
}
