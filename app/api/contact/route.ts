import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { ContactNotificationEmail } from "@/lib/notifications/templates/contact-notification";

export async function POST(req: NextRequest) {
  const { name, email, phone, message } = await req.json() as {
    name: string;
    email: string;
    phone?: string;
    message: string;
  };

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Name, email and message are required." }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any;

  // Save to DB
  const { error: dbError } = await supabase
    .from("contact_submissions")
    .insert({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone?.trim() || null, message: message.trim() });

  if (dbError) {
    return NextResponse.json({ error: "Failed to save submission." }, { status: 500 });
  }

  // Send notification email
  const notifyEmail = process.env.CONTACT_NOTIFY_EMAIL ?? process.env.RESEND_FROM_EMAIL;
  if (notifyEmail && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const html = await render(ContactNotificationEmail({ name: name.trim(), email: email.trim(), phone: phone?.trim(), message: message.trim() }));
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "noreply@wildheartpsychotherapy.com.au",
        to: notifyEmail,
        replyTo: email.trim(),
        subject: `New contact message from ${name.trim()}`,
        html,
      });
    } catch (e) {
      console.error("Contact email failed:", e);
      // Don't fail the request — submission is already saved
    }
  }

  return NextResponse.json({ ok: true });
}
