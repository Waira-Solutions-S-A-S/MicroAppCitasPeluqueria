import { getCurrentUser } from "@/lib/auth";
import { createBooking } from "@/lib/booking";
import { rateLimit } from "@/lib/rate-limit";
import { bookingSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "local";
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Iniciá sesión para reservar." }, { status: 401 });
  }

  const limit = rateLimit(`booking:${clientIp(request)}`, 10, 10 * 60_000);
  if (!limit.ok) {
    return Response.json(
      { error: "Demasiados intentos. Esperá unos minutos antes de volver a reservar." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "El cuerpo del pedido no es JSON válido." }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      {
        error: "Revisá los datos del formulario.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const result = await createBooking(parsed.data);
  if (!result.ok) {
    const status = result.code === "SLOT_TAKEN" ? 409 : 400;
    return Response.json({ error: result.message, code: result.code }, { status });
  }

  return Response.json(
    { id: result.id, seriesId: result.seriesId, occurrences: result.occurrences },
    { status: 201 },
  );
}
