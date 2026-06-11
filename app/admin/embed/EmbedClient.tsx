"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const LOCATIONS = [
  { slug: "brunswick", name: "Brunswick" },
  { slug: "lorne", name: "Lorne" },
];

export function EmbedClient({ appUrl, icalUrl }: { appUrl: string; icalUrl: string }) {
  return (
    <div className="px-4 py-5 max-w-2xl mx-auto space-y-10">
      <div>
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
              <EmbedPanel appUrl={appUrl} location={loc} />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-1">Calendar subscription (iCal)</h2>
        <p className="text-sm text-gray-500 mb-4">
          Subscribe to this URL in Google Calendar, Apple Calendar, or Outlook to see all upcoming appointments.
        </p>
        <CopyRow label="iCal feed URL" value={icalUrl} />
        <p className="text-xs text-gray-400 mt-2">
          Keep this URL private — anyone with it can view your appointments.
        </p>
      </div>
    </div>
  );
}

function EmbedPanel({ appUrl, location }: { appUrl: string; location: { slug: string; name: string } }) {
  const bookingUrl = `${appUrl}/appointments/${location.slug}?embed=true`;
  const iframeCode = `<iframe
  src="${bookingUrl}"
  width="100%"
  height="700"
  frameborder="0"
  style="border-radius: 16px; border: 1px solid #e5e7eb;"
  title="Book an appointment — Wildheart Psychotherapy ${location.name}"
></iframe>`;

  return (
    <div className="space-y-4">
      <CopyRow label="Booking URL" value={bookingUrl} />
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Embed code</p>
        <div className="relative">
          <pre className="bg-gray-50 border rounded-xl p-4 text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap break-all">
            {iframeCode}
          </pre>
          <CopyButton text={iframeCode} />
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
        <strong>Before publishing:</strong> set <code className="bg-amber-100 px-1 rounded text-xs">NEXT_PUBLIC_APP_URL</code> to your production domain.
      </div>
    </div>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      <div className="flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-2.5">
        <span className="text-sm text-gray-600 truncate flex-1">{value}</span>
        <CopyButton text={value} />
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs bg-card border rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition-colors shrink-0"
    >
      {copied ? (
        <><Check className="h-3.5 w-3.5 text-green-500" />Copied</>
      ) : (
        <><Copy className="h-3.5 w-3.5" />Copy</>
      )}
    </button>
  );
}
