import { PageContent } from "./PageContent";
import type { SidebarBlock as SidebarBlockType } from "@/lib/supabase/types";

export async function SidebarBlock({ block }: { block: SidebarBlockType }) {
  return (
    <div className="space-y-4">
      {block.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={block.image_url}
          alt=""
          className="w-full rounded-lg"
        />
      )}
      {block.button_label && block.button_url && (
        <a
          href={block.button_url}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-medium text-sm text-white! transition-opacity hover:opacity-80"
          style={{ backgroundColor: "#f57c00" }}
        >
          {block.button_label}
        </a>
      )}
      {block.body && (
        <div className="text-sm [&_h1]:text-xl [&_h2]:text-lg [&_h3]:text-base [&_p]:text-stone-600 [&_p]:leading-relaxed [&_p]:mb-3 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-stone-500 [&_blockquote]:my-4">
          <PageContent content={block.body} />
        </div>
      )}
    </div>
  );
}
