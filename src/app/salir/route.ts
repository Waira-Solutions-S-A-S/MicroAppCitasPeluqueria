import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/?sesion=cerrada", request.url));
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
