"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { cancelBookingById } from "@/lib/booking";

export async function cancelPublicAppointment(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await cancelBookingById(id);
  revalidatePath(`/reserva/${id}`);
}
