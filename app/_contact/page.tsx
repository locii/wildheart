import type { Metadata } from "next";
import { getMenuNav } from "@/lib/cms";
import { PublicLayout } from "@/components/public/PublicLayout";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact — Wildheart Psychotherapy",
  description: "Get in touch with Wildheart Psychotherapy.",
};

export default async function ContactPage() {
  const nav = await getMenuNav("main-nav");
  return (
    <PublicLayout nav={nav}>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-3 leading-tight">Get in touch</h1>
        <p className="text-stone-500 mb-10">Send a message and I'll get back to you as soon as possible.</p>
        <ContactForm />
      </div>
    </PublicLayout>
  );
}
