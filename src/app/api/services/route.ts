import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [services, staff] = await Promise.all([
      prisma.service.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          description: true,
          durationMin: true,
          priceCents: true,
          color: true,
        },
      }),
      prisma.staffMember.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          color: true,
          services: { select: { id: true } },
        },
      }),
    ]);

    return Response.json({
      services,
      staff: staff.map(({ services: staffServices, ...member }) => ({
        ...member,
        serviceIds: staffServices.map((service) => service.id),
      })),
    });
  } catch (error: any) {
    console.error("Error fetching services:", error);
    return Response.json(
      { error: "Error interno al obtener los servicios." },
      { status: 500 }
    );
  }
}
