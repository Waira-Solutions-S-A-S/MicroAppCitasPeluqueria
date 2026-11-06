"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSession, destroySession, getCurrentUser, requireAdmin } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import {
  appointmentStatusSchema,
  loginSchema,
  passwordSchema,
  serviceSchema,
  settingsSchema,
  staffSchema,
} from "@/lib/validation";

export type LoginState = { error?: string };

function back(path: string, key: "ok" | "error", value: string): never {
  redirect(`${path}?${key}=${encodeURIComponent(value)}`);
}

function parseTime(value: FormDataEntryValue | null, fallback: number): number {
  if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) return fallback;
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function pesosToCents(value: FormDataEntryValue | null): number {
  const amount = Number(String(value ?? "").replace(",", "."));
  if (!Number.isFinite(amount)) return -1;
  return Math.round(amount * 100);
}

export async function loginAction(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Completá email y contraseña." };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return { error: "Email o contraseña incorrectos." };
  }

  await createSession(user.id);
  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

export async function createServiceAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    description: String(formData.get("description") ?? "").trim() || undefined,
    durationMin: formData.get("durationMin"),
    priceCents: pesosToCents(formData.get("price")),
    color: String(formData.get("color") ?? "") || undefined,
  });

  if (!parsed.success) {
    back("/admin/servicios", "error", "Revisá los datos del servicio.");
  }

  await prisma.service.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      durationMin: parsed.data.durationMin,
      priceCents: parsed.data.priceCents,
      color: parsed.data.color ?? "#8b5cf6",
      sortOrder: await prisma.service.count(),
    },
  });

  revalidatePath("/admin/servicios");
  revalidatePath("/");
  back("/admin/servicios", "ok", "Servicio creado.");
}

export async function updateServiceAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    description: String(formData.get("description") ?? "").trim() || undefined,
    durationMin: formData.get("durationMin"),
    priceCents: pesosToCents(formData.get("price")),
    color: String(formData.get("color") ?? "") || undefined,
  });

  if (!id || !parsed.success) {
    back("/admin/servicios", "error", "Revisá los datos del servicio.");
  }

  await prisma.service.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      durationMin: parsed.data.durationMin,
      priceCents: parsed.data.priceCents,
      color: parsed.data.color,
    },
  });

  revalidatePath("/admin/servicios");
  revalidatePath("/");
  back("/admin/servicios", "ok", "Servicio actualizado.");
}

export async function toggleServiceAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) back("/admin/servicios", "error", "Servicio inválido.");

  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) back("/admin/servicios", "error", "Servicio inválido.");

  await prisma.service.update({
    where: { id },
    data: { isActive: !service.isActive },
  });

  revalidatePath("/admin/servicios");
  revalidatePath("/");
  back("/admin/servicios", "ok", service.isActive ? "Servicio pausado." : "Servicio activado.");
}

export async function createStaffAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = staffSchema.safeParse({
    name: formData.get("name"),
    color: String(formData.get("color") ?? "") || undefined,
  });

  if (!parsed.success) {
    back("/admin/horarios", "error", "Revisá el nombre del profesional.");
  }

  const allServices = await prisma.service.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  const member = await prisma.staffMember.create({
    data: {
      name: parsed.data.name,
      color: parsed.data.color ?? "#0ea5e9",
      services: { connect: allServices },
    },
  });

  for (let day = 0; day < 7; day += 1) {
    await prisma.workingHours.create({
      data: {
        staffId: member.id,
        weekday: day,
        startMin: 9 * 60,
        endMin: day === 6 ? 14 * 60 : 19 * 60,
        isClosed: day === 0,
      },
    });
  }

  revalidatePath("/admin/horarios");
  revalidatePath("/");
  back("/admin/horarios", "ok", "Profesional creado.");
}

export async function updateStaffAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const parsed = staffSchema.safeParse({
    name: formData.get("name"),
    color: String(formData.get("color") ?? "") || undefined,
    serviceIds: formData.getAll("serviceIds").map(String).filter(Boolean),
  });

  if (!id || !parsed.success) {
    back("/admin/horarios", "error", "Revisá los datos del profesional.");
  }

  const assignedServices = await prisma.service.findMany({
    where: { id: { in: parsed.data.serviceIds ?? [] } },
    select: { id: true },
  });

  await prisma.staffMember.update({
    where: { id },
    data: {
      name: parsed.data.name,
      color: parsed.data.color,
      services: { set: assignedServices },
    },
  });

  revalidatePath("/admin/horarios");
  revalidatePath("/");
  back("/admin/horarios", "ok", "Profesional actualizado.");
}

export async function toggleStaffAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) back("/admin/horarios", "error", "Profesional inválido.");

  const member = await prisma.staffMember.findUnique({ where: { id } });
  if (!member) back("/admin/horarios", "error", "Profesional inválido.");

  await prisma.staffMember.update({
    where: { id },
    data: { isActive: !member.isActive },
  });

  revalidatePath("/admin/horarios");
  revalidatePath("/");
  back("/admin/horarios", "ok", member.isActive ? "Profesional pausado." : "Profesional activado.");
}

export async function saveHoursAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const staffId = String(formData.get("staffId") ?? "");
  if (!staffId) back("/admin/horarios", "error", "Profesional inválido.");

  for (let day = 0; day < 7; day += 1) {
    const isOpen = formData.get(`open-${day}`) === "on";
    const startMin = parseTime(formData.get(`start-${day}`), 9 * 60);
    const endMin = parseTime(formData.get(`end-${day}`), 19 * 60);

    if (isOpen && endMin <= startMin) {
      back("/admin/horarios", "error", "El cierre debe ser posterior a la apertura.");
    }

    await prisma.workingHours.upsert({
      where: { staffId_weekday: { staffId, weekday: day } },
      update: { startMin, endMin, isClosed: !isOpen },
      create: { staffId, weekday: day, startMin, endMin, isClosed: !isOpen },
    });
  }

  revalidatePath("/admin/horarios");
  back("/admin/horarios", "ok", "Horarios guardados.");
}

export async function updateSettingsAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = settingsSchema.safeParse({
    businessName: formData.get("businessName"),
    tagline: String(formData.get("tagline") ?? "").trim() || undefined,
    currency: formData.get("currency"),
    timezone: formData.get("timezone"),
    slotStepMin: formData.get("slotStepMin"),
    bufferMin: formData.get("bufferMin"),
    minLeadHours: formData.get("minLeadHours"),
    maxAdvanceDays: formData.get("maxAdvanceDays"),
  });

  if (!parsed.success) {
    back("/admin/ajustes", "error", "Revisá los ajustes del negocio.");
  }

  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {
      businessName: parsed.data.businessName,
      tagline: parsed.data.tagline ?? "",
      currency: parsed.data.currency.toUpperCase(),
      timezone: parsed.data.timezone,
      slotStepMin: parsed.data.slotStepMin,
      bufferMin: parsed.data.bufferMin,
      minLeadHours: parsed.data.minLeadHours,
      maxAdvanceDays: parsed.data.maxAdvanceDays,
    },
    create: {
      id: "singleton",
      businessName: parsed.data.businessName,
      tagline: parsed.data.tagline ?? "",
      currency: parsed.data.currency.toUpperCase(),
      timezone: parsed.data.timezone,
      slotStepMin: parsed.data.slotStepMin,
      bufferMin: parsed.data.bufferMin,
      minLeadHours: parsed.data.minLeadHours,
      maxAdvanceDays: parsed.data.maxAdvanceDays,
    },
  });

  revalidatePath("/admin/ajustes");
  revalidatePath("/");
  back("/admin/ajustes", "ok", "Ajustes guardados.");
}

export async function changePasswordAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    back("/admin/ajustes", "error", "La nueva contraseña debe tener al menos 8 caracteres.");
  }

  const record = await prisma.user.findUnique({ where: { id: user.id } });
  if (!record || !verifyPassword(parsed.data.currentPassword, record.passwordHash)) {
    back("/admin/ajustes", "error", "La contraseña actual no es correcta.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashPassword(parsed.data.newPassword) },
  });

  back("/admin/ajustes", "ok", "Contraseña actualizada.");
}

export async function updateAppointmentStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = appointmentStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    redirect("/admin/agenda");
  }

  await prisma.appointment.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/agenda");
  revalidatePath("/reserva/" + parsed.data.id);
}
