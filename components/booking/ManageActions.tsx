"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { AppointmentWithRelations } from "@/lib/supabase/types";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export function ManageActions({
  token,
  appointment,
}: {
  token: string;
  appointment: AppointmentWithRelations;
}) {
  const router = useRouter();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  async function cancel() {
    setCancelling(true);
    await fetch(`/api/appointments/${appointment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cancelled: true }),
    });
    setCancelled(true);
    setCancelOpen(false);
    setCancelling(false);
  }

  if (cancelled) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500 mb-4">Your appointment has been cancelled.</p>
        <p className="text-xs text-gray-400">A confirmation will be sent to your email.</p>
      </div>
    );
  }

  const start = toZonedTime(new Date(appointment.start_at), appointment.timezone);

  return (
    <>
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push(`/manage/${token}/reschedule`)}
        >
          Reschedule appointment
        </Button>
        <Button
          variant="outline"
          className="w-full text-red-600 hover:text-red-700 hover:border-red-300"
          onClick={() => setCancelOpen(true)}
        >
          Cancel appointment
        </Button>
      </div>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Cancel appointment?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Your {appointment.type.name} on {format(start, "d MMMM")} at {format(start, "h:mm a")} will be cancelled.
          </p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setCancelOpen(false)}>
              Keep it
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={cancel}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling…" : "Yes, cancel"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
