"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { HolidayBanner } from "@/components/HolidayBanner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";

export default function HolidayPage() {
  const supabase = useMemo(() => createClient(), []);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isSavingHolidayMode, setIsSavingHolidayMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingHolidayMode, setLoadingHolidayMode] = useState(true);
  const [holidayModeActive, setHolidayModeActive] = useState(false);

  useEffect(() => {
    async function loadHolidayMode() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoadingHolidayMode(false);
        return;
      }

      const metadataValue = user.user_metadata?.holiday_mode_active;
      if (typeof metadataValue === "boolean") {
        setHolidayModeActive(metadataValue);
      }
      setLoadingHolidayMode(false);
    }

    void loadHolidayMode();
  }, [supabase]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage("");
    const apiResponse = await fetch("/api/holiday-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = (await apiResponse.json()) as { planSummary: string };
    setResponse(data.planSummary);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { error } = await supabase.auth.updateUser({
      data: { ...user.user_metadata, holiday_mode_active: true },
    });

    if (error) {
      setErrorMessage("Unable to update holiday mode right now.");
      return;
    }

    setHolidayModeActive(true);
  }

  async function endHolidayMode() {
    setErrorMessage("");
    setIsSavingHolidayMode(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMessage("Unable to update holiday mode right now.");
      setIsSavingHolidayMode(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      data: { ...user.user_metadata, holiday_mode_active: false },
    });

    if (error) {
      setErrorMessage("Unable to update holiday mode right now.");
      setIsSavingHolidayMode(false);
      return;
    }

    setHolidayModeActive(false);
    setIsSavingHolidayMode(false);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl space-y-4 px-4 py-8">
      <HolidayBanner />
      <Card className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-100">Holiday planning</h1>
        <p className="text-sm text-slate-300">
          Where are you heading and how long will you be away? Do you have access to any equipment (hotel gym, resistance bands you’re packing, etc.)? How much time per day can you dedicate to exercise?
        </p>
        <form onSubmit={onSubmit} className="space-y-2">
          <textarea id="holiday-details" aria-label="Holiday details" className="min-h-28 w-full rounded-lg bg-slate-800 p-2 text-sm" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="I’m away for ten days with a hotel gym and 30 minutes most mornings." />
          <div className="flex gap-2">
            <Button type="submit">Generate holiday plan</Button>
            <Button type="button" variant="secondary" onClick={endHolidayMode} disabled={loadingHolidayMode || isSavingHolidayMode || !holidayModeActive}>
              {isSavingHolidayMode ? "Saving…" : "End holiday mode"}
            </Button>
          </div>
        </form>
        {response ? <p className="rounded-lg bg-slate-800 p-3 text-sm text-slate-200">{response}</p> : null}
        {!holidayModeActive ? <p className="text-sm text-green-300">Holiday mode ended. Your regular training schedule is active again.</p> : null}
        {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}
      </Card>
    </main>
  );
}
