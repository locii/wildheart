"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const LOCATIONS = [
  { slug: "brunswick", name: "Brunswick" },
  { slug: "lorne", name: "Lorne" },
];

export default function EmbedPage() {
  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-1">Embed booking widget</h1>
      <p className="text-sm text-gray-500 mb-6">
        Copy the code below and paste it into your website where you want the booking calendar to appear.
      </p>

      <Tabs defaultValue="brunswick">
        <TabsList className="w-full mb-6">
          {LOCATIONS.map((loc) => (
            <TabsTrigger key={loc.slug} value={loc.slug} className="flex-1">
              {loc.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {LOCATIONS.map((loc) => (
          <TabsContent key={loc.slug} value={loc.slug} className="space-y-6">
            <EmbedPanel location={loc} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function EmbedPanel({ location }: { location: { slug: string; name: string } }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const bookingUrl = `${appUrl}/book/${location.slug}?embed=true`;

  const iframeCode = `<iframe
  src="${bookingUrl}"
  width="100%"
  height="700"
  frameborder="0"
  style="border-radius: 16px; border: 1px solid #e5e7eb;"
  title="Book an appointment — Wildheart Psychotherapy ${location.name}"
></iframe>`;

  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Booking URL</p>
        <div className="flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-2.5">
          <span className="text-sm text-gray-600 truncate flex-1">{bookingUrl}</span>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Embed code</p>
        <div className="relative">
          <pre className="bg-gray-50 border rounded-xl p-4 text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap break-all">
            {iframeCode}
          </pre>
          <button
            onClick={copy}
            className="absolute top-3 right-3 flex items-center gap-1.5 text-xs bg-card border rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
          >
            {copied ? (
              <><Check className="h-3.5 w-3.5 text-green-500" /> Copied</>
            ) : (
              <><Copy className="h-3.5 w-3.5" /> Copy</>
            )}
          </button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
        <strong>Before publishing:</strong> set <code className="bg-amber-100 px-1 rounded text-xs">NEXT_PUBLIC_APP_URL</code> in your environment variables to your production domain (e.g. <code className="bg-amber-100 px-1 rounded text-xs">https://book.wildheart.com.au</code>).
      </div>
    </div>
  );
}
