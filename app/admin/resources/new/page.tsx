import Link from "next/link";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { ChevronLeft } from "lucide-react";
import type { Article } from "@/lib/supabase/types";

const blank: Article = {
  id: "",
  slug: null,
  title: "",
  excerpt: null,
  content: null,
  external_url: null,
  published_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function NewArticlePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/admin/resources" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="h-4 w-4" />Resources
      </Link>
      <h1 className="text-xl font-semibold mb-6">New article</h1>
      <ArticleEditor article={blank} isNew />
    </div>
  );
}
