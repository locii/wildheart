import { createServiceClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Notification, Client } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const PER_PAGE = 100;

type NotificationRow = Notification & {
  appointment: {
    start_at: string;
    client: Pick<Client, "first_name" | "last_name">;
  } | null;
};

const TYPE_LABELS: Record<Notification["type"], string> = {
  booking: "Booking",
  cancellation: "Cancellation",
  reschedule: "Reschedule",
  reminder_24h: "Reminder 24h",
  reminder_48h: "Reminder 48h",
  reminder_1h: "Reminder 1h",
};

export default async function NotificationsPage() {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("notifications")
    .select("*, appointment:appointments(start_at, client:clients(first_name, last_name))")
    .order("created_at", { ascending: false })
    .limit(PER_PAGE);

  const rows = (data ?? []) as NotificationRow[];

  return (
    <div className="px-8 py-5 max-w-5xl mx-auto">
      <h1 className="text-xl font-semibold mb-5">Notification Log</h1>

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <th className="px-4 py-3">Sent</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Appt Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No notifications yet.
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const clientName = row.appointment?.client
                ? `${row.appointment.client.first_name} ${row.appointment.client.last_name}`
                : "—";
              const apptDate = row.appointment?.start_at
                ? format(new Date(row.appointment.start_at), "MMM d, yyyy h:mm a")
                : "—";
              const sentAt = row.sent_at
                ? format(new Date(row.sent_at), "MMM d h:mm a")
                : row.created_at
                  ? format(new Date(row.created_at), "MMM d h:mm a")
                  : "—";

              return (
                <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{sentAt}</td>
                  <td className="px-4 py-3 font-medium">{clientName}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{apptDate}</td>
                  <td className="px-4 py-3">{TYPE_LABELS[row.type] ?? row.type}</td>
                  <td className="px-4 py-3 capitalize">{row.channel}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        row.status === "sent" && "bg-green-100 text-green-800",
                        row.status === "failed" && "bg-red-100 text-red-800",
                        row.status === "skipped" && "bg-gray-100 text-gray-600",
                        row.status === "pending" && "bg-yellow-100 text-yellow-800"
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-red-500 max-w-xs truncate">
                    {row.error ?? ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Showing the {PER_PAGE} most recent notifications.
      </p>
    </div>
  );
}
