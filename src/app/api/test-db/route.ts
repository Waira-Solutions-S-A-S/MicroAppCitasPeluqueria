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
        stack: error?.stack,
        cause: error?.cause ? String(error.cause) : undefined,
      },
      { status: 200 } // return 200 so we can read the JSON error in the browser/fetch
    );
  }
}
