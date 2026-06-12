"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-4xl sm:text-4xl font-bold text-stone-900 mb-6 leading-tight">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-3xl font-semibold text-stone-800 mt-10 mb-4 leading-snug">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-semibold text-stone-800 mt-8 mb-3">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="text-stone-700 leading-relaxed mb-5">{children}</p>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="underline underline-offset-2 transition-colors"
            style={{ color: "#f57c00" }}
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {children}
          </a>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-outside ml-5 mb-5 space-y-1 text-stone-700">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-outside ml-5 mb-5 space-y-1 text-stone-700">{children}</ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-amber-400 pl-5 my-6 text-stone-600 italic">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-8 border-stone-200" />,
        strong: ({ children }) => <strong className="font-semibold text-stone-900">{children}</strong>,
        em: ({ children }) => <em className="italic text-stone-600">{children}</em>,
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          return isBlock ? (
            <code className="block bg-stone-100 rounded-lg px-4 py-3 text-sm font-mono text-stone-800 overflow-x-auto my-4">
              {children}
            </code>
          ) : (
            <code className="bg-stone-100 rounded px-1.5 py-0.5 text-sm font-mono text-stone-800">
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
