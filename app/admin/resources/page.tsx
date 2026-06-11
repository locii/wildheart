import { createServiceClient } from "@/lib/supabase/server";
import { ArticleList } from "@/components/admin/ArticleList";
import type { Article } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function ResourcesListPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any;
  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, slug, external_url, published_at, image_url")
    .order("published_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Articles</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{articles?.length ?? 0} articles</p>
      </div>
      <ArticleList articles={(articles ?? []) as Article[]} />
    </div>
  );
}
