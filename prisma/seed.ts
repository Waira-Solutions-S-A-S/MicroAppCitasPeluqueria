import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../src/lib/password";
import { addDays, addMinutes, nowWallClock, startOfDay } from "../src/lib/time";

const prisma = new PrismaClient();

type Seeded = { id: string; durationMin: number };

async function main() {
  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", maxAdvanceDays: 180 },
  });

  const adminEmail = "admin@estudio.local";
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Administración",
        passwordHash: hashPassword("admin123"),
      },
    });
  }

  const serviceSeed = [
    {
      name: "Corte de pelo",
      description: "Corte, lavado y styling.",
      durationMin: 45,
      priceCents: 1_200_000,
      color: "#8b5cf6",
      sortOrder: 1,
    },
    {
      name: "Color / tintura",
      description: "Color completo con tratamiento.",
      durationMin: 120,
      priceCents: 3_500_000,
      color: "#db2777",
      sortOrder: 2,
    },
    {
      name: "Manicura",
      description: "Manicura tradicional con esmaltado.",
      durationMin: 60,
      priceCents: 900_000,
      color: "#0ea5e9",
      sortOrder: 3,
    },
    {
      name: "Kapping de uñas",
      description: "Kapping con gel y diseño.",
      durationMin: 90,
      priceCents: 1_600_000,
      color: "#14b8a6",
      sortOrder: 4,
    },
    {
      name: "Peinado",
      description: "Peinado para eventos y fiestas.",
      durationMin: 60,
      priceCents: 1_000_000,
      color: "#f59e0b",
      sortOrder: 5,
    },
  ];

  const services: Seeded[] = [];
  for (const item of serviceSeed) {
    const existing = await prisma.service.findFirst({ where: { name: item.name } });
    const service =
      existing ??
      (await prisma.service.create({
        data: {
          name: item.name,
          description: item.description,
          durationMin: item.durationMin,
          priceCents: item.priceCents,
          color: item.color,
          sortOrder: item.sortOrder,
        },
      }));
    services.push({ id: service.id, durationMin: service.durationMin });
  }

  const staffSeed = [
    { name: "Camila", color: "#7c3aed" },
    { name: "Martina", color: "#db2777" },
  ];

  const staff: string[] = [];
  for (const item of staffSeed) {
    const existing = await prisma.staffMember.findFirst({ where: { name: item.name } });
    const member =
      existing ?? (await prisma.staffMember.create({ data: { name: item.name, color: item.color } }));
    staff.push(member.id);
  }

  for (const memberId of staff) {
    for (let day = 0; day < 7; day += 1) {
      const isClosed = day === 0;
      const startMin = 9 * 60;
      const endMin = day === 6 ? 14 * 60 : 19 * 60;
      await prisma.workingHours.upsert({
        where: { staffId_weekday: { staffId: memberId, weekday: day } },
        update: {},
        create: { staffId: memberId, weekday: day, startMin, endMin, isClosed },
      });
    }
  }

  const existingAppointments = await prisma.appointment.count();
  if (existingAppointments === 0) {
    const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
    const today = startOfDay(nowWallClock(settings?.timezone ?? "America/Argentina/Buenos_Aires"));
    const tomorrow = addDays(today, 1);

    const demo = [
      {
        serviceId: services[0].id,
        staffId: staff[0],
        startAt: addMinutes(tomorrow, 10 * 60),
        durationMin: services[0].durationMin,
        clientName: "Sofía Ramírez",
        clientPhone: "11 5555 1234",
        status: "CONFIRMED",
        notes: "Prefiere secado natural.",
      },
      {
        serviceId: services[2].id,
        staffId: staff[1],
        startAt: addMinutes(tomorrow, 10 * 60),
        durationMin: services[2].durationMin,
        clientName: "Julieta Torres",
        clientPhone: "11 4444 9876",
        status: "PENDING",
        notes: null,
      },
      {
        serviceId: services[1].id,
        staffId: staff[0],
        startAt: addMinutes(tomorrow, 12 * 60),
        durationMin: services[1].durationMin,
        clientName: "Malena Ortiz",
        clientPhone: "11 3333 2211",
        status: "CONFIRMED",
        notes: "Tinte rubio, retocar raíz.",
      },
    ];

    for (const item of demo) {
      await prisma.appointment.create({
        data: {
          serviceId: item.serviceId,
          staffId: item.staffId,
          startAt: item.startAt,
          endAt: addMinutes(item.startAt, item.durationMin),
          clientName: item.clientName,
          clientPhone: item.clientPhone,
          status: item.status,
          notes: item.notes,
        },
      });
    }
  }

  console.log("Seed listo.");
  console.log(`Admin: ${adminEmail} / admin123`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
