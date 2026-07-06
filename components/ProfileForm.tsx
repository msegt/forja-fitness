"use client";

import { FormEvent, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export function ProfileForm({
  initialData,
}: {
  initialData: { fullName: string; dateOfBirth: string; weightKg: string; heightCm: string };
}) {
  const supabase = createClient();
  const [form, setForm] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    setErrorMessage("");
    setIsSaving(true);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) { setErrorMessage("Unable to save profile."); setIsSaving(false); return; }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: form.fullName,
      date_of_birth: form.dateOfBirth || null,
      weight_kg: form.weightKg ? Number(form.weightKg) : null,
      height_cm: form.heightCm ? Number(form.heightCm) : null,
    });

    if (error) { setErrorMessage("Unable to save profile."); setIsSaving(false); return; }
    setSaved(true);
    setIsSaving(false);
  }

  return (
    <Card className="space-y-3">
      <form onSubmit={onSubmit} className="space-y-3">
        <label htmlFor="profile-full-name" className="block text-sm text-zinc-300">Full name</label>
        <input id="profile-full-name" required className="w-full rounded-xl bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-coral-500" placeholder="Full name" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
        <label htmlFor="profile-dob" className="block text-sm text-zinc-300">Date of birth</label>
        <input id="profile-dob" required type="date" className="w-full rounded-xl bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-coral-500" value={form.dateOfBirth} onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))} />
        <label htmlFor="profile-weight" className="block text-sm text-zinc-300">Weight (kg)</label>
        <input id="profile-weight" required type="number" className="w-full rounded-xl bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-coral-500" placeholder="e.g. 65" value={form.weightKg} onChange={(e) => setForm((p) => ({ ...p, weightKg: e.target.value }))} />
        <label htmlFor="profile-height" className="block text-sm text-zinc-300">Height (cm)</label>
        <input id="profile-height" required type="number" className="w-full rounded-xl bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-coral-500" placeholder="e.g. 165" value={form.heightCm} onChange={(e) => setForm((p) => ({ ...p, heightCm: e.target.value }))} />
        <Button type="submit" disabled={isSaving}>{isSaving ? "Saving…" : "Save profile"}</Button>
      </form>
      {saved ? <p className="text-sm text-green-400">✅ Profile saved.</p> : null}
      {errorMessage ? <p className="text-sm text-rose-400">{errorMessage}</p> : null}
    </Card>
  );
}
