"use client";

import { useState } from "react";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { format } from "date-fns";
import type { Notification } from "@/lib/supabase/types";

export type FailedNotification = Pick<Notification, "id" | "appointment_id" | "type" | "channel" | "error" | "created_at"> & {
  appointment: {
    start_at: string;
    client: { first_name: string; last_name: string };
  };
};

const TYPE_LABELS: Record<Notification["type"], string> = {
  booking: "Booking",
  cancellation: "Cancellation",
  reschedule: "Reschedule",
  reminder_24h: "Reminder 24h",
  reminder_48h: "Reminder 48h",
  reminder_1h: "Reminder 1h",
};

async function resolve(id: string) {
  await fetch(`/api/notifications/${id}`, { method: "PATCH" });
}

export function FailedNotificationsBanner({ initial }: { initial: FailedNotification[] }) {
  const [items, setItems] = useState(initial);
  const [retrying, setRetrying] = useState<Set<string>>(new Set());
  const [retried, setRetried] = useState<Map<string, "sent" | "failed">>(new Map());

  if (items.length === 0) return null;

  async function retry(item: FailedNotification) {
    setRetrying((prev) => new Set(prev).add(item.id));

    const res = await fetch(`/api/appointments/${item.appointment_id}/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: item.type, channels: [item.channel] }),
    });

    const data = await res.json().catch(() => ({ ok: false }));
    const result = data.ok ? "sent" : "failed";

    setRetrying((prev) => { const s = new Set(prev); s.delete(item.id); return s; });
    setRetried((prev) => new Map(prev).set(item.id, result));

    if (result === "sent") {
      await resolve(item.id);
      setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== item.id)), 1500);
    }
  }

  async function dismiss(id: string) {
    await resolve(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-amber-200 bg-amber-100/60">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
        <span className="text-xs font-semibold text-amber-800">
          {items.length} failed notification{items.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="divide-y divide-amber-100">
        {items.map((item) => {
          const status = retried.get(item.id);
          const isRetrying = retrying.has(item.id);

          return (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-800">
                  {item.appointment.client.first_name} {item.appointment.client.last_name}
                </span>
                <span className="mx-1.5 text-gray-300">·</span>
                <span className="text-sm text-gray-500">{TYPE_LABELS[item.type]} via {item.channel}</span>
                <span className="mx-1.5 text-gray-300">·</span>
                <span className="text-xs text-gray-400">
                  {format(new Date(item.appointment.start_at), "d MMM")}
                </span>
                {item.error && (
                  <p className="text-xs text-red-500 mt-0.5 truncate">{item.error}</p>
                )}
              </div>

              {status === "sent" && (
                <span className="text-xs text-green-600 font-medium shrink-0">Sent ✓</span>
              )}
              {status === "failed" && (
                <span className="text-xs text-red-500 font-medium shrink-0">Failed again</span>
              )}
              {!status && (
                <button
                  onClick={() => retry(item)}
                  disabled={isRetrying}
                  className="flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 disabled:opacity-50 shrink-0 transition-colors"
                >
                  <RefreshCw className={`h-3 w-3 ${isRetrying ? "animate-spin" : ""}`} />
                  {isRetrying ? "Sending…" : "Send again"}
                </button>
              )}
              <button
                onClick={() => dismiss(item.id)}
                className="text-gray-300 hover:text-gray-500 shrink-0 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
