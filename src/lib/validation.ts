import { z } from "zod";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const bookingSchema = z.object({
  serviceId: z.string().min(1),
  staffId: z.string().min(1),
  startAt: z.string().min(1),
  clientName: z.string().trim().min(2).max(80),
  clientPhone: z.string().trim().min(6).max(30),
  clientEmail: z
    .string()
    .trim()
    .max(120)
    .refine((value) => value === "" || EMAIL_PATTERN.test(value), "email inválido")
    .optional(),
  notes: z.string().trim().max(500).optional(),
  repeat: z
    .object({
      intervalWeeks: z.number().int().min(1).max(12),
      occurrences: z.number().int().min(2).max(24),
    })
    .nullable()
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().min(3).max(120),
  password: z.string().min(4).max(200),
});

export const serviceSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).optional(),
  durationMin: z.coerce.number().int().min(5).max(480),
  priceCents: z.coerce.number().int().min(0).max(100_000_000),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "color inválido")
    .optional(),
});

export const staffSchema = z.object({
  name: z.string().trim().min(2).max(80),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "color inválido")
    .optional(),
  serviceIds: z.array(z.string().min(1)).optional(),
});

export const settingsSchema = z.object({
  businessName: z.string().trim().min(2).max(80),
  tagline: z.string().trim().max(120).optional(),
  currency: z.string().trim().min(3).max(3),
  timezone: z.string().trim().min(3).max(60),
  slotStepMin: z.coerce.number().int().min(5).max(120),
  bufferMin: z.coerce.number().int().min(0).max(240),
  minLeadHours: z.coerce.number().int().min(0).max(720),
  maxAdvanceDays: z.coerce.number().int().min(1).max(365),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(4).max(200),
  newPassword: z.string().min(8).max(200),
});

export const appointmentStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]),
});
