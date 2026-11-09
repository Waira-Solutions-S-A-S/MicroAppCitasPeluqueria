export type MinimalService = {
  id: string;
  name: string;
  durationMin: number;
  priceCents: number;
  color?: string;
  description?: string | null;
};

const EXTRA_TAG_PREFIX = "[EXTRA_SERVICES:";
const EXTRA_TAG_SUFFIX = "]";

/**
 * Encodes extra service IDs into the appointment notes field.
 * Example: "[EXTRA_SERVICES:srv_2,srv_3]\nPor favor corte con tijera"
 */
export function encodeAppointmentNotes(
  extraServiceIds: string[],
  userNotes?: string | null,
): string | null {
  const cleanUserNotes = userNotes?.trim() || "";

  if (extraServiceIds.length === 0) {
    return cleanUserNotes || null;
  }

  const tag = `${EXTRA_TAG_PREFIX}${extraServiceIds.join(",")}${EXTRA_TAG_SUFFIX}`;
  if (!cleanUserNotes) {
    return tag;
  }

  return `${tag}\n${cleanUserNotes}`;
}

/**
 * Extracts extra service IDs and the clean user notes from raw appointment notes.
 */
export function decodeAppointmentNotes(rawNotes?: string | null): {
  extraServiceIds: string[];
  cleanNotes: string | null;
} {
  if (!rawNotes || !rawNotes.trim()) {
    return { extraServiceIds: [], cleanNotes: null };
  }

  const trimmed = rawNotes.trim();
  if (!trimmed.startsWith(EXTRA_TAG_PREFIX)) {
    return { extraServiceIds: [], cleanNotes: trimmed };
  }

  const closeIdx = trimmed.indexOf(EXTRA_TAG_SUFFIX);
  if (closeIdx === -1) {
    return { extraServiceIds: [], cleanNotes: trimmed };
  }

  const idsStr = trimmed.slice(EXTRA_TAG_PREFIX.length, closeIdx);
  const extraServiceIds = idsStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const remainder = trimmed.slice(closeIdx + 1).trim();
  return {
    extraServiceIds,
    cleanNotes: remainder || null,
  };
}

/**
 * Resolves full list of services for an appointment given its primary service,
 * raw notes, and an optional lookup map/array of services.
 */
export function resolveAppointmentServices<T extends MinimalService>(
  primaryService: T,
  rawNotes?: string | null,
  allServicesMap?: Map<string, T> | T[],
): {
  services: T[];
  totalDurationMin: number;
  totalPriceCents: number;
  cleanNotes: string | null;
  serviceNamesLabel: string;
} {
  const { extraServiceIds, cleanNotes } = decodeAppointmentNotes(rawNotes);

  const servicesList: T[] = [primaryService];

  if (extraServiceIds.length > 0 && allServicesMap) {
    const lookup =
      allServicesMap instanceof Map
        ? allServicesMap
        : new Map(allServicesMap.map((s) => [s.id, s]));

    for (const id of extraServiceIds) {
      const found = lookup.get(id);
      if (found) {
        servicesList.push(found);
      }
    }
  }

  const totalDurationMin = servicesList.reduce((acc, s) => acc + s.durationMin, 0);
  const totalPriceCents = servicesList.reduce((acc, s) => acc + s.priceCents, 0);
  const serviceNamesLabel = servicesList.map((s) => s.name).join(" + ");

  return {
    services: servicesList,
    totalDurationMin,
    totalPriceCents,
    cleanNotes,
    serviceNamesLabel,
  };
}
