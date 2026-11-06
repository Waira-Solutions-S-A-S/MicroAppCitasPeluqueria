import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import {
  addDays,
  addMinutes,
  dateKey,
  minutesSinceMidnight,
  nowWallClock,
  startOfDay,
  weekday,
} from "@/lib/time";

export const MAX_OCCURRENCES = 24;
export const MAX_INTERVAL_WEEKS = 12;

export type RepeatInput = {
  intervalWeeks: number;
  occurrences: number;
};

export type BookingInput = {
  serviceId: string;
  staffId: string;
  startAt: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string | null;
  notes?: string | null;
  repeat?: RepeatInput | null;
};

export type BookingSuccess = {
  ok: true;
  id: string;
  seriesId: string | null;
  occurrences: number;
};

export type BookingFailure = {
  ok: false;
  code: string;
  message: string;
};

export type BookingResult = BookingSuccess | BookingFailure;

class BookingError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

function fail(code: string, message: string): BookingFailure {
  return { ok: false, code, message };
}

export async function createBooking(input: BookingInput): Promise<BookingResult> {
  const settings = await getSettings();

  const service = await prisma.service.findFirst({
    where: { id: input.serviceId, isActive: true },
  });
  if (!service) return fail("SERVICE_NOT_FOUND", "El servicio ya no está disponible.");

  const staff = await prisma.staffMember.findFirst({
    where: {
      id: input.staffId,
      isActive: true,
      services: { some: { id: service.id } },
    },
  });
  if (!staff) return fail("STAFF_NOT_FOUND", "El profesional no atiende este servicio.");

  const base = new Date(input.startAt);
  if (Number.isNaN(base.getTime())) return fail("BAD_DATE", "La fecha elegida no es válida.");

  const occurrences = input.repeat
    ? Math.min(Math.max(Math.trunc(input.repeat.occurrences), 2), MAX_OCCURRENCES)
    : 1;
  const intervalWeeks = input.repeat
    ? Math.min(Math.max(Math.trunc(input.repeat.intervalWeeks), 1), MAX_INTERVAL_WEEKS)
    : 0;

  // Normalize to the minute and compute every occurrence.
  const baseMs = Math.floor(base.getTime() / 60_000) * 60_000;
  const starts: Date[] = [];
  for (let index = 0; index < occurrences; index += 1) {
    starts.push(new Date(baseMs + index * intervalWeeks * 7 * 86_400_000));
  }

  const now = nowWallClock(settings.timezone);
  const today = startOfDay(now);
  const earliest = addMinutes(now, settings.minLeadHours * 60);
  const latestDay = addDays(today, settings.maxAdvanceDays);
  const bufferMs = settings.bufferMin * 60_000;
  const durationMs = service.durationMin * 60_000;

  // Validate working hours and lead time before touching the database.
  for (const start of starts) {
    if (start.getTime() < earliest.getTime()) {
      return fail("TOO_SOON", "El turno está dentro del tiempo mínimo de anticipación.");
    }
    if (startOfDay(start).getTime() > latestDay.getTime()) {
      return fail("TOO_FAR", "La fecha supera el máximo de anticipación permitido.");
    }

    const hours = await prisma.workingHours.findUnique({
      where: { staffId_weekday: { staffId: staff.id, weekday: weekday(start) } },
    });
    if (!hours || hours.isClosed) {
      return fail("CLOSED", "El profesional no atiende ese día.");
    }
    const startMinute = minutesSinceMidnight(start);
    if (startMinute < hours.startMin || startMinute + service.durationMin > hours.endMin) {
      return fail("OUTSIDE_HOURS", "El horario elegido está fuera del horario de atención.");
    }
  }

  const email = input.clientEmail?.trim() ? input.clientEmail.trim() : null;
  const notes = input.notes?.trim() ? input.notes.trim() : null;

  try {
    const created = await prisma.$transaction(async (tx) => {
      // Re-check conflicts inside the transaction (serialized writes on SQLite).
      for (const start of starts) {
        const end = new Date(start.getTime() + durationMs);
        const conflict = await tx.appointment.findFirst({
          where: {
            staffId: staff.id,
            status: { not: "CANCELLED" },
            startAt: { lt: new Date(end.getTime() + bufferMs) },
            endAt: { gt: new Date(start.getTime() - bufferMs) },
          },
          select: { id: true },
        });
        if (conflict) {
          throw new BookingError(
            "SLOT_TAKEN",
            "Ese horario acaba de ocuparse. Elegí otro, por favor.",
          );
        }
      }

      let seriesId: string | null = null;
      if (input.repeat && occurrences > 1) {
        const series = await tx.recurringSeries.create({
          data: { intervalWeeks, occurrences },
        });
        seriesId = series.id;
      }

      let firstId = "";
      for (const start of starts) {
        const appointment = await tx.appointment.create({
          data: {
            serviceId: service.id,
            staffId: staff.id,
            clientName: input.clientName,
            clientPhone: input.clientPhone,
            clientEmail: email,
            notes,
            startAt: start,
            endAt: new Date(start.getTime() + durationMs),
            status: "PENDING",
            seriesId,
          },
        });
        if (!firstId) firstId = appointment.id;
      }

      return { id: firstId, seriesId };
    });

    return { ok: true, id: created.id, seriesId: created.seriesId, occurrences };
  } catch (error) {
    if (error instanceof BookingError) return fail(error.code, error.message);
    console.error("createBooking failed", error);
    return fail("UNKNOWN", "No pudimos guardar la reserva. Intentá de nuevo.");
  }
}

/** Cancel a booking from the public confirmation page using its id. */
export async function cancelBookingById(id: string): Promise<boolean> {
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) return false;
  if (appointment.status === "CANCELLED") return true;
  await prisma.appointment.update({ where: { id }, data: { status: "CANCELLED" } });
  return true;
}

export function seriesDayLabel(seriesId: string): string {
  return seriesId.slice(0, 8);
}

export { dateKey };
