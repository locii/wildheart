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
      <div className="text-center py-4 space-y-4">
        <div>
          <p className="text-sm text-gray-800 mb-1">Your appointment has been cancelled.</p>
          <p className="text-xs text-gray-400">A confirmation will be sent to your email.</p>
        </div>
        <Button
          variant="outline"
          className="w-full bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
          onClick={() => router.push("/appointments")}
        >
          Book a new appointment
        </Button>
      </div>
    );
  }

  const start = toZonedTime(new Date(appointment.start_at), appointment.timezone);

  return (
    <>
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full text-black bg-white cursor-pointer"
          onClick={() => router.push(`/manage/${token}/reschedule`)}
        >
          Reschedule appointment
        </Button>
        <Button
          variant="outline"
          className="w-full text-black bg-white cursor-pointer"
          onClick={() => setCancelOpen(true)}
        >
          Cancel appointment
        </Button>
      </div>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="max-w-sm mx-4 bg-white text-gray-900 border border-gray-200 shadow-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 text-base font-semibold">Cancel appointment?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Your {appointment.type.name} on {format(start, "d MMMM")} at {format(start, "h:mm a")} will be cancelled.
          </p>
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              className="flex-1 bg-white text-gray-900 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
              onClick={() => setCancelOpen(false)}
            >
              Keep it
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-white text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
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
