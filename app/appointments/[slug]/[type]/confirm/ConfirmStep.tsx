"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import type { Location, AppointmentType } from "@/lib/supabase/types";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-stone-500 shrink-0">{label}</span>
      <span className="text-right font-medium text-stone-800">{value}</span>
    </div>
  );
}

export function ConfirmStep({
  location,
  apptType,
  date,
  slot,
  client,
  locationSlug,
  typeSlug,
}: {
  location: Location;
  apptType: AppointmentType;
  date: string;
  slot: string;  // ISO start time
  client: { first_name: string; last_name: string; email: string; phone: string };
  locationSlug: string;
  typeSlug: string;
}) {
  const router = useRouter();
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  const slotDate = parseISO(slot);
  // Compute end time
  const slotEnd = new Date(slotDate.getTime() + apptType.duration_minutes * 60 * 1000);
  const timeLabel = `${format(slotDate, "h:mm")}–${format(slotEnd, "h:mm a")}`;
  const dateLabel = format(parseISO(date), "EEEE d MMMM yyyy");

  async function confirm() {
    setBooking(true);
    setError("");
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locationSlug,
        typeId: apptType.id,
        start: slot,
        client,
        source: "self-book",
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Something went wrong. Please try again.");
      setBooking(false);
      return;
    }
    const params = new URLSearchParams({
      id: json.appointment.id,
      token: json.token,
      ...(json.isNewClient ? { intake: "1" } : {}),
    });
    router.push(`/${locationSlug}/success?${params}`);
  }

  return (
    <div className="space-y-4">
      <div className="bg-stone-50 rounded-xl p-4 space-y-2.5 text-sm border border-stone-100">
        <Row label="Service" value={apptType.name} />
        <Row label="Location" value={location.name} />
        <Row label="Date" value={dateLabel} />
        <Row label="Time" value={timeLabel} />
        <Row label="Duration" value={`${apptType.duration_minutes} min`} />
        {apptType.price > 0 && <Row label="Fee" value={`$${apptType.price}`} />}
        <div className="border-t border-stone-200 pt-2.5 mt-1">
          <Row label="Name" value={`${client.first_name} ${client.last_name}`} />
          <Row label="Email" value={client.email} />
          {client.phone && <Row label="Phone" value={client.phone} />}
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button onClick={confirm} disabled={booking} className="w-full" size="lg">
        {booking ? "Booking…" : "Confirm booking"}
      </Button>
    </div>
  );
}
