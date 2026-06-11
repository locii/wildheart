import { createServiceClient } from "@/lib/supabase/server";
import { PageList } from "@/components/admin/PageList";

export const dynamic = "force-dynamic";

type PageRow = { slug: string; title: string; updated_at: string };

export default async function PagesListPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any;
  const { data: pages } = await supabase.from("pages").select("slug, title, updated_at");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Pages</h1>
      </div>
      <PageList pages={(pages ?? []) as PageRow[]} />
    </div>
  );
}
