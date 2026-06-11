import { createServiceClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { Mail, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContactSubmissionsPage() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  const submissions = data ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Contact messages</h1>
          <p className="text-sm text-muted-foreground">{submissions.length} total</p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">No messages yet.</p>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <div key={s.id} className="bg-card border rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm">{s.name}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <a href={`mailto:${s.email}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <Mail className="h-3 w-3" />{s.email}
                    </a>
                    {s.phone && (
                      <a href={`tel:${s.phone}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <Phone className="h-3 w-3" />{s.phone}
                      </a>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {format(new Date(s.created_at), "d MMM yyyy, h:mm a")}
                </span>
              </div>
              <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed border-t pt-3">{s.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
