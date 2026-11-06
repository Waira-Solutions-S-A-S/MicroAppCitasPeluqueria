import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "reservas_sesion";
const SESSION_DAYS = 7;
// Development fallback. In production set AUTH_SECRET.
const DEV_SECRET = "reservas-pwa-dev-secret-do-not-use-in-production-2f8a1c";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

function getSecret(): Uint8Array {
  return new TextEncoder().encode(process.env.AUTH_SECRET ?? DEV_SECRET);
}

export async function createSession(userId: string): Promise<void> {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const id = typeof payload.sub === "string" ? payload.sub : null;
    if (!id) return null;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;

    return { id: user.id, email: user.email, name: user.name, role: user.role };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}
