import type { NextRequest } from "next/server";

import { getAvailability } from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const serviceId = request.nextUrl.searchParams.get("serviceId");
  const date = request.nextUrl.searchParams.get("date");
  const staffId = request.nextUrl.searchParams.get("staffId");

  if (!serviceId || !date) {
    return Response.json(
      { error: "Faltan parámetros: serviceId y date son obligatorios." },
      { status: 400 },
    );
  }

  const availability = await getAvailability(serviceId, date, staffId);
  if (!availability) {
    return Response.json({ error: "Servicio o fecha inválidos." }, { status: 404 });
  }

  return Response.json(availability);
}
