"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookingShell } from "@/components/booking/BookingShell";
import type { IntakeQuestion } from "@/lib/supabase/types";

export default function IntakePage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const appointmentId = searchParams.get("appointmentId");
  const locationSlug = params.slug as string;

  const [questions, setQuestions] = useState<IntakeQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/intake")
      .then((r) => r.json())
      .then(({ questions }) => {
        setQuestions(questions ?? []);
        setLoading(false);
      });
  }, []);

  async function handleSubmit(skipped: boolean) {
    if (!appointmentId) return;
    setSubmitting(true);
    await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId, data: answers, skipped }),
    });
    router.push(`/appointments/${locationSlug}/success?skipped=${skipped ? "1" : "0"}`);
  }

  if (loading) {
    return (
      <BookingShell backHref="/appointments" backLabel="Back to booking">
        <div className="px-8 py-12 text-center text-sm text-gray-400">Loading…</div>
      </BookingShell>
    );
  }

  if (questions.length === 0) {
    return (
      <BookingShell backHref="/appointments" backLabel="Back to booking">
        <div className="px-8 py-12 text-center">
          <p className="text-sm text-gray-400 mb-4">No intake form needed.</p>
          <Button onClick={() => router.push(`/appointments/${locationSlug}/success`)}>
            Continue
          </Button>
        </div>
      </BookingShell>
    );
  }

  return (
    <BookingShell backHref="/appointments" backLabel="Back to booking">
      <div className="px-8 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Intake Form</h1>
        <p className="text-sm text-gray-400 mb-6">
          Help us prepare for your first session. You can skip this and complete it later.
        </p>

        <div className="space-y-5">
          {questions.map((q) => (
            <div key={q.id} className="space-y-1.5">
              <Label>
                {q.question}
                {q.required && <span className="text-red-400 ml-0.5">*</span>}
              </Label>
              {q.field_type === "textarea" ? (
                <Textarea
                  value={answers[q.field_key] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.field_key]: e.target.value }))}
                  rows={3}
                />
              ) : (
                <Input
                  value={answers[q.field_key] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.field_key]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-8">
          <Button onClick={() => handleSubmit(false)} disabled={submitting} className="flex-1">
            {submitting ? "Submitting…" : "Submit"}
          </Button>
          <Button variant="outline" onClick={() => handleSubmit(true)} disabled={submitting}>
            Skip
          </Button>
        </div>
      </div>
    </BookingShell>
  );
}
