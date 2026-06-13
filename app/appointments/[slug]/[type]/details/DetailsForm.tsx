"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function DetailsForm({
  locationSlug,
  typeSlug,
  date,
  slot,
}: {
  locationSlug: string;
  typeSlug: string;
  date: string;
  slot: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "" });

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const valid = form.first_name.trim() && form.last_name.trim() && form.email.trim().includes("@");

  function next(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    const params = new URLSearchParams({ date, slot });
    params.set("first", form.first_name.trim());
    params.set("last", form.last_name.trim());
    params.set("email", form.email.trim());
    if (form.phone.trim()) params.set("phone", form.phone.trim());
    router.push(`/${locationSlug}/${typeSlug}/confirm?${params}`);
  }

  return (
    <form onSubmit={next} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="first_name">First name</Label>
          <Input
            id="first_name"
            value={form.first_name}
            onChange={(e) => update("first_name", e.target.value)}
            autoComplete="given-name"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="last_name">Last name</Label>
          <Input
            id="last_name"
            value={form.last_name}
            onChange={(e) => update("last_name", e.target.value)}
            autoComplete="family-name"
            required
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          autoComplete="email"
          inputMode="email"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">
          Phone <span className="text-stone-400 font-normal">(optional)</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          autoComplete="tel"
          inputMode="tel"
        />
      </div>
      <Button type="submit" className="w-full mt-2" disabled={!valid}>
        Continue
      </Button>
    </form>
  );
}
