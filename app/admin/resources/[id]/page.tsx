import { notFound } from "next/navigation";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { ChevronLeft } from "lucide-react";
import type { Article } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any;
  const { data: article } = await supabase.from("articles").select("*").eq("id", id).single();
  if (!article) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/admin/resources" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="h-4 w-4" />Resources
      </Link>
      <h1 className="text-xl font-semibold mb-6">{(article as Article).title}</h1>
      <ArticleEditor article={article as Article} />
    </div>
  );
}
