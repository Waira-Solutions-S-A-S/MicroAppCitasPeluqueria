"use server";

import { revalidatePath } from "next/cache";

import { cancelBookingById } from "@/lib/booking";

export async function cancelPublicAppointment(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await cancelBookingById(id);
  revalidatePath(`/reserva/${id}`);
}
