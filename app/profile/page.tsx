"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const supabase = useMemo(() => createClient(), []);
  const [form, setForm] = useState({ fullName: "", dateOfBirth: "", weightKg: "", heightCm: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMessage("Unable to load profile.");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, date_of_birth, weight_kg, height_cm")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setErrorMessage("Unable to load profile.");
        setIsLoading(false);
        return;
      }

      setForm({
        fullName: data?.full_name ?? user.user_metadata?.full_name ?? "",
        dateOfBirth: data?.date_of_birth ?? "",
        weightKg: data?.weight_kg?.toString() ?? "",
        heightCm: data?.height_cm?.toString() ?? "",
      });
      setIsLoading(false);
    }

    void loadProfile();
  }, [supabase]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    setErrorMessage("");
    setIsSaving(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMessage("Unable to save profile.");
      setIsSaving(false);
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: form.fullName,
      date_of_birth: form.dateOfBirth || null,
      weight_kg: form.weightKg ? Number(form.weightKg) : null,
      height_cm: form.heightCm ? Number(form.heightCm) : null,
    });

    if (error) {
      setErrorMessage("Unable to save profile.");
      setIsSaving(false);
      return;
    }

    setSaved(true);
    setIsSaving(false);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl space-y-4 px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-100">Profile settings</h1>
      <Card className="space-y-3">
        {isLoading ? <p className="text-sm text-slate-300">Loading profile…</p> : null}
        <form onSubmit={onSubmit} className="space-y-3">
          <label htmlFor="profile-full-name" className="block text-sm text-slate-300">Full name</label>
          <input id="profile-full-name" required aria-required="true" className="w-full rounded-lg bg-slate-800 p-2 text-sm" placeholder="Full name" value={form.fullName} onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))} />
          <label htmlFor="profile-dob" className="block text-sm text-slate-300">Date of birth</label>
          <input id="profile-dob" required aria-required="true" className="w-full rounded-lg bg-slate-800 p-2 text-sm" type="date" value={form.dateOfBirth} onChange={(event) => setForm((prev) => ({ ...prev, dateOfBirth: event.target.value }))} />
          <label htmlFor="profile-weight" className="block text-sm text-slate-300">Weight (kg)</label>
          <input id="profile-weight" required aria-required="true" className="w-full rounded-lg bg-slate-800 p-2 text-sm" type="number" placeholder="Weight (kg)" value={form.weightKg} onChange={(event) => setForm((prev) => ({ ...prev, weightKg: event.target.value }))} />
          <label htmlFor="profile-height" className="block text-sm text-slate-300">Height (cm)</label>
          <input id="profile-height" required aria-required="true" className="w-full rounded-lg bg-slate-800 p-2 text-sm" type="number" placeholder="Height (cm)" value={form.heightCm} onChange={(event) => setForm((prev) => ({ ...prev, heightCm: event.target.value }))} />
          <Button type="submit" disabled={isLoading || isSaving}>
            {isSaving ? "Saving…" : "Save profile"}
          </Button>
        </form>
        {saved ? <p className="text-sm text-green-300">Profile saved.</p> : null}
        {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}
      </Card>
    </main>
  );
}
