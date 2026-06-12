import type { SupabaseClient } from "@supabase/supabase-js";

const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL ?? "";

export function buildManageUrl(token: string): string {
  return `${APP_URL()}/manage/${token}`;
}

export async function createAppointmentToken(
  supabase: SupabaseClient,
  appointmentId: string,
  appointmentStartAt: string
): Promise<string> {
  // Token expires 1 hour before the appointment
  const expiresAt = new Date(new Date(appointmentStartAt).getTime() - 60 * 60 * 1000).toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("appointment_tokens") as any)
    .insert({ appointment_id: appointmentId, expires_at: expiresAt })
    .select("token")
    .single();

  return data?.token ?? "";
}

export async function validateToken(
  supabase: SupabaseClient,
  token: string
): Promise<{ appointmentId: string } | null> {
  const { data } = await supabase
    .from("appointment_tokens")
    .select("appointment_id, expires_at, used_at")
    .eq("token", token)
    .maybeSingle();

  if (!data) return null;
  if (data.used_at) return null;
  if (new Date(data.expires_at) < new Date()) return null;

  return { appointmentId: data.appointment_id as string };
}
