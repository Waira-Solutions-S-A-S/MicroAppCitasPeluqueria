import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import {
  addDays,
  dateKey,
  MS_MINUTE,
  nowWallClock,
  parseDateKey,
  startOfDay,
  weekday,
} from "@/lib/time";

export type Slot = {
  startAt: string;
  endAt: string;
  staffId: string;
  staffName: string;
  staffColor: string;
};

export type Availability = {
  date: string;
  service: { id: string; name: string; durationMin: number; priceCents: number; color: string };
  settings: {
    slotStepMin: number;
    bufferMin: number;
    minLeadHours: number;
    maxAdvanceDays: number;
    currency: string;
  };
  slots: Slot[];
};

export async function getAvailability(
  serviceId: string,
  dayKey: string,
  staffId?: string | null,
): Promise<Availability | null> {
  const parts = parseDateKey(dayKey);
  if (!parts) return null;

  const service = await prisma.service.findFirst({
    where: { id: serviceId, isActive: true },
  });
  if (!service) return null;

  const settings = await getSettings();
  const dayStart = startOfDay(new Date(Date.UTC(parts.y, parts.m - 1, parts.d)));
  const dayEnd = addDays(dayStart, 1);
  const dayWeekday = weekday(dayStart);
  const now = nowWallClock(settings.timezone);
  const today = startOfDay(now);
  const earliest = new Date(now.getTime() + settings.minLeadHours * 60 * MS_MINUTE);
  const latest = addDays(today, settings.maxAdvanceDays);

  const staffList = await prisma.staffMember.findMany({
    where: {
      isActive: true,
      ...(staffId ? { id: staffId } : {}),
      services: { some: { id: serviceId } },
    },
    orderBy: { createdAt: "asc" },
  });

  const slots: Slot[] = [];
  const bufferMs = settings.bufferMin * MS_MINUTE;
  const durationMs = service.durationMin * MS_MINUTE;

  for (const staff of staffList) {
    if (dayStart.getTime() > latest.getTime()) continue;

    const hours = await prisma.workingHours.findUnique({
      where: { staffId_weekday: { staffId: staff.id, weekday: dayWeekday } },
    });
    if (!hours || hours.isClosed || hours.endMin <= hours.startMin) continue;

    const [appointments, timeOff] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          staffId: staff.id,
          status: { not: "CANCELLED" },
          startAt: { lt: dayEnd },
          endAt: { gt: dayStart },
        },
        select: { startAt: true, endAt: true },
      }),
      prisma.timeOff.findMany({
        where: {
          staffId: staff.id,
          startAt: { lt: dayEnd },
          endAt: { gt: dayStart },
        },
        select: { startAt: true, endAt: true },
      }),
    ]);

    const blocks = [...appointments, ...timeOff].map((block) => ({
      start: block.startAt.getTime() - bufferMs,
      end: block.endAt.getTime() + bufferMs,
    }));

    for (
      let minute = hours.startMin;
      minute + service.durationMin <= hours.endMin;
      minute += settings.slotStepMin
    ) {
      const start = new Date(dayStart.getTime() + minute * MS_MINUTE);
      const end = new Date(start.getTime() + durationMs);

      if (start.getTime() < earliest.getTime()) continue;
      if (dayStart.getTime() > latest.getTime()) continue;

      const overlaps = blocks.some(
        (block) => start.getTime() < block.end && end.getTime() > block.start,
      );
      if (overlaps) continue;

      slots.push({
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        staffId: staff.id,
        staffName: staff.name,
        staffColor: staff.color,
      });
    }
  }

  slots.sort((a, b) => a.startAt.localeCompare(b.startAt));

  return {
    date: dateKey(dayStart),
    service: {
      id: service.id,
      name: service.name,
      durationMin: service.durationMin,
      priceCents: service.priceCents,
      color: service.color,
    },
    settings: {
      slotStepMin: settings.slotStepMin,
      bufferMin: settings.bufferMin,
      minLeadHours: settings.minLeadHours,
      maxAdvanceDays: settings.maxAdvanceDays,
      currency: settings.currency,
    },
    slots,
  };
}
