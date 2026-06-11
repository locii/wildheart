import { EmbedClient } from "./EmbedClient";

export default function EmbedPage() {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const secret = process.env.ICAL_SECRET ?? "";
  const icalUrl = secret
    ? `${appUrl}/api/calendar/ical?token=${secret}`
    : "(set ICAL_SECRET env var to enable)";

  return <EmbedClient appUrl={appUrl} icalUrl={icalUrl} />;
}
