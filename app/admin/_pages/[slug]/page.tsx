import { notFound } from "next/navigation";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { PageEditor } from "@/components/admin/PageEditor";
import { NewPageForm } from "@/components/admin/NewPageForm";
import { ChevronLeft } from "lucide-react";
import type { Page, SidebarBlock } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function EditPagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any;

  if (slug === "new") {
    const { data: blocks } = await supabase.from("sidebar_blocks").select("*").order("name");
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/admin/pages" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="h-4 w-4" />Pages
        </Link>
        <h1 className="text-xl font-semibold mb-6">New page</h1>
        <NewPageForm />
      </div>
    );
  }

  const [{ data: page }, { data: blocks }] = await Promise.all([
    supabase.from("pages").select("*").eq("slug", decodeURIComponent(slug)).single(),
    supabase.from("sidebar_blocks").select("*").order("name"),
  ]);
  if (!page) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/admin/pages" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="h-4 w-4" />Pages
      </Link>
      <h1 className="text-xl font-semibold mb-6">{(page as Page).title}</h1>
      <PageEditor page={page as Page} sidebarBlocks={(blocks ?? []) as SidebarBlock[]} />
    </div>
  );
}
