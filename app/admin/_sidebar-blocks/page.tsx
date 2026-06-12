import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import type { SidebarBlock } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function SidebarBlocksListPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any;
  const { data: blocks } = await supabase.from("sidebar_blocks").select("*").order("name");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Blocks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Reusable content blocks assigned to pages</p>
        </div>
        <Link href="/admin/sidebar-blocks/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" />New block
          </Button>
        </Link>
      </div>

      {(!blocks || blocks.length === 0) ? (
        <p className="text-sm text-muted-foreground">No sidebar blocks yet.</p>
      ) : (
        <div className="space-y-2">
          {(blocks as SidebarBlock[]).map((block) => (
            <div key={block.id} className="bg-card border rounded-xl px-4 py-3 flex items-center gap-3">
              {block.image_url && (
                <img src={block.image_url} alt="" className="w-10 h-10 object-cover rounded-md shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{block.name}</p>
                {block.button_label && (
                  <p className="text-xs text-muted-foreground truncate">{block.button_label}</p>
                )}
              </div>
              <Link href={`/admin/sidebar-blocks/${block.id}`}>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
