import { notFound } from "next/navigation";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { SidebarBlockEditor } from "@/components/admin/SidebarBlockEditor";
import { ChevronLeft } from "lucide-react";
import type { SidebarBlock } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function EditSidebarBlockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (id === "new") {
    const empty: SidebarBlock = {
      id: "",
      name: "",
      image_url: null,
      button_label: null,
      button_url: null,
      body: null,
      updated_at: "",
    };
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/admin/sidebar-blocks" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="h-4 w-4" />Sidebar blocks
        </Link>
        <h1 className="text-xl font-semibold mb-6">New sidebar block</h1>
        <SidebarBlockEditor block={empty} isNew />
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any;
  const { data: block } = await supabase.from("sidebar_blocks").select("*").eq("id", id).single();
  if (!block) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/admin/sidebar-blocks" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="h-4 w-4" />Sidebar blocks
      </Link>
      <h1 className="text-xl font-semibold mb-6">{(block as SidebarBlock).name}</h1>
      <SidebarBlockEditor block={block as SidebarBlock} />
    </div>
  );
}
