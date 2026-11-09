import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const hasTursoUrl = Boolean(process.env.TURSO_DATABASE_URL);
    const hasTursoToken = Boolean(process.env.TURSO_AUTH_TOKEN);
    const tursoUrlPrefix = process.env.TURSO_DATABASE_URL ? process.env.TURSO_DATABASE_URL.slice(0, 15) : null;

    const count = await prisma.service.count();

    return NextResponse.json({
      status: "ok",
      hasTursoUrl,
      hasTursoToken,
      tursoUrlPrefix,
      serviceCount: count,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        name: error?.name,
        message: error?.message,
        code: error?.code,
        stack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}
