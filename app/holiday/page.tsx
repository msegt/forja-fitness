"use client";

import { FormEvent, useState } from "react";
import { HolidayBanner } from "@/components/HolidayBanner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function HolidayPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const apiResponse = await fetch("/api/holiday-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = (await apiResponse.json()) as { planSummary: string };
    setResponse(data.planSummary);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl space-y-4 px-4 py-8">
      <HolidayBanner />
      <Card className="space-y-3">
        <h1 className="text-2xl font-semibold">Holiday planning</h1>
        <p className="text-sm text-slate-300">
          Where are you heading and how long will you be away? Do you have access to any equipment (hotel gym, resistance bands you’re packing, etc.)? How much time per day can you dedicate to exercise?
        </p>
        <form onSubmit={onSubmit} className="space-y-2">
          <textarea className="min-h-28 w-full rounded-lg bg-slate-800 p-2 text-sm" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="I’m away for ten days with a hotel gym and 30 minutes most mornings." />
          <div className="flex gap-2">
            <Button type="submit">Generate holiday plan</Button>
            <Button type="button" variant="secondary">End holiday mode</Button>
          </div>
        </form>
        {response ? <p className="rounded-lg bg-slate-800 p-3 text-sm text-slate-200">{response}</p> : null}
      </Card>
    </main>
  );
}
