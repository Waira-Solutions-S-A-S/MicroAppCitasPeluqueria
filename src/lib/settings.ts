import { prisma } from "@/lib/prisma";

export async function getSettings() {
  try {
    return await prisma.settings.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton" },
    });
  } catch (e) {
    console.warn("Settings table not ready, using fallback settings:", e);
    return {
      id: "singleton",
      businessName: "Estudio Nube",
      tagline: "Turnos de belleza sin vueltas",
      timezone: "America/Bogota",
      currency: "COP",
      slotStepMin: 15,
      bufferMin: 10,
      minLeadHours: 2,
      maxAdvanceDays: 180,
    };
  }
}
