import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-muted/50">
      <AdminNav />
      <div className="flex flex-col flex-1 min-w-0">
        <main className="flex-1 pb-24 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
