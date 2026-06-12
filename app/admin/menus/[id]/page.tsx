import { notFound } from "next/navigation";
import { getMenuById } from "@/lib/cms";
import { MenuEditor } from "@/components/admin/MenuEditor";
import { createServiceClient } from "@/lib/supabase/server";
import type { AppointmentType, Article, Page } from "@/lib/supabase/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => createServiceClient() as any;

export default async function MenuEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [menu, pagesRes, articlesRes, typesRes] = await Promise.all([
    getMenuById(id),
    db().from("pages").select("slug, title").eq("is_public", true).order("slug"),
    db().from("articles").select("id, slug, title").eq("published", true).order("title"),
    db().from("appointment_types").select("id, name").eq("is_active", true).order("name"),
  ]);

  if (!menu) notFound();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <MenuEditor
        menu={menu}
        pages={(pagesRes.data ?? []) as Pick<Page, "slug" | "title">[]}
        articles={(articlesRes.data ?? []) as Pick<Article, "id" | "slug" | "title">[]}
        appointmentTypes={(typesRes.data ?? []) as Pick<AppointmentType, "id" | "name">[]}
      />
    </div>
  );
}
