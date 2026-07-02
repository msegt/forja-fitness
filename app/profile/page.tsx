"use client";

import { FormEvent, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
  const [form, setForm] = useState({ fullName: "", dateOfBirth: "", weightKg: "", heightCm: "" });
  const [saved, setSaved] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl space-y-4 px-4 py-8">
      <h1 className="text-3xl font-bold">Profile settings</h1>
      <Card className="space-y-3">
        <form onSubmit={onSubmit} className="space-y-3">
          <label htmlFor="profile-full-name" className="block text-sm text-slate-300">Full name</label>
          <input id="profile-full-name" required aria-required="true" className="w-full rounded-lg bg-slate-800 p-2 text-sm" placeholder="Full name" value={form.fullName} onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))} />
          <label htmlFor="profile-dob" className="block text-sm text-slate-300">Date of birth</label>
          <input id="profile-dob" required aria-required="true" className="w-full rounded-lg bg-slate-800 p-2 text-sm" type="date" value={form.dateOfBirth} onChange={(event) => setForm((prev) => ({ ...prev, dateOfBirth: event.target.value }))} />
          <label htmlFor="profile-weight" className="block text-sm text-slate-300">Weight (kg)</label>
          <input id="profile-weight" required aria-required="true" className="w-full rounded-lg bg-slate-800 p-2 text-sm" type="number" placeholder="Weight (kg)" value={form.weightKg} onChange={(event) => setForm((prev) => ({ ...prev, weightKg: event.target.value }))} />
          <label htmlFor="profile-height" className="block text-sm text-slate-300">Height (cm)</label>
          <input id="profile-height" required aria-required="true" className="w-full rounded-lg bg-slate-800 p-2 text-sm" type="number" placeholder="Height (cm)" value={form.heightCm} onChange={(event) => setForm((prev) => ({ ...prev, heightCm: event.target.value }))} />
          <Button type="submit">Save profile</Button>
        </form>
        {saved ? <p className="text-sm text-green-300">Profile saved.</p> : null}
      </Card>
    </main>
  );
}
