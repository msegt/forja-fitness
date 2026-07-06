"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import type { WorkoutPlan } from "@/types";

const goals = [
  "lose weight",
  "build strength",
  "improve flexibility",
  "improve cardio",
  "general fitness",
  "reduce stress",
  "postnatal recovery",
];

const equipmentOptions = [
  "none",
  "resistance bands",
  "dumbbells",
  "kettlebell",
  "pull-up bar",
  "gym access",
  "other",
];

const totalSteps = 8;

const RETRY_STATUS_MESSAGES = [
  "Creating your plan…",
  "The AI is busy right now — retrying for you…",
  "Still working on it. Demand is high but we’ll get there…",
  "Almost there — just one more try…",
];

export function OnboardingWizard() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [step, setStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [planPreview, setPlanPreview] = useState<WorkoutPlan | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    dateOfBirth: "",
    weightKg: "",
    heightCm: "",
    fitnessLevel: "beginner",
    postnatal: false,
    goals: [] as string[],
    daysPerWeek: "3",
    sessionLength: "30",
    equipment: [] as string[],
    equipmentOther: "",
    healthNotes: "",
  });

  // Preload saved profile so returning users don't retype their details
  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setProfileLoaded(true); return; }

      const { data } = await supabase
        .from("profiles")
        .select("full_name, date_of_birth, weight_kg, height_cm, fitness_level, goals, health_notes")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setForm((prev) => ({
          ...prev,
          fullName: data.full_name ?? user.user_metadata?.full_name ?? prev.fullName,
          dateOfBirth: data.date_of_birth ?? prev.dateOfBirth,
          weightKg: data.weight_kg != null ? String(data.weight_kg) : prev.weightKg,
          heightCm: data.height_cm != null ? String(data.height_cm) : prev.heightCm,
          fitnessLevel: data.fitness_level ?? prev.fitnessLevel,
          goals: Array.isArray(data.goals) && data.goals.length > 0 ? data.goals : prev.goals,
          healthNotes: data.health_notes ?? prev.healthNotes,
        }));
      }

      setProfileLoaded(true);
    }
    void loadProfile();
  }, [supabase]);

  // Rotate the status message while the server is retrying
  useEffect(() => {
    if (!isLoading) { setStatusMessage(""); return; }

    setStatusMessage(RETRY_STATUS_MESSAGES[0]);
    const timers = RETRY_STATUS_MESSAGES.slice(1).map((msg, i) =>
      window.setTimeout(() => setStatusMessage(msg), (i + 1) * 5000),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [isLoading]);

  const canGoNext = useMemo(() => {
    if (step === 2) return Boolean(form.fullName && form.dateOfBirth && form.weightKg && form.heightCm);
    if (step === 4) return form.goals.length > 0;
    return true;
  }, [form, step]);

  async function handleGeneratePreview(event: FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        plan?: WorkoutPlan;
        error?: string;
        attempts?: number;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to generate your plan right now. Please try again.");
      }
      if (!payload.plan) {
        throw new Error("No plan was returned. Please try again.");
      }

      setPlanPreview(payload.plan);
      setShowPreview(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong while generating your plan.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSavePlan() {
    if (!planPreview) return;
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plan: planPreview, savePlan: true }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? "Unable to save your plan right now. Please try again.");
      }
      router.push("/dashboard");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save plan.");
    } finally {
      setIsLoading(false);
    }
  }

  const updateArray = (field: "goals" | "equipment", value: string) => {
    const current = form[field];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setForm((prev) => ({ ...prev, [field]: next }));
  };

  const isReturningUser = profileLoaded && Boolean(form.fullName);

  return (
    <Card className="mx-auto w-full max-w-2xl space-y-5">
      {!showPreview ? (
        <p className="text-xs uppercase tracking-wide text-zinc-400">Step {step} of {totalSteps}</p>
      ) : null}

      {/* Step 1 — Welcome */}
      {step === 1 ? (
        <div className="space-y-3">
          <p className="text-base font-medium text-white">
            {isReturningUser ? `Welcome back, ${form.fullName.split(" ")[0]} 👋` : "Welcome to Forja 👋"}
          </p>
          <p className="text-sm text-zinc-300">
            {isReturningUser
              ? "We’ve kept your details from last time. Just check they’re still correct and we’ll build you a fresh plan."
              : "We’ll build a training programme that genuinely fits around your life — short enough to squeeze in during nap time, effective enough to make you feel strong again."}
          </p>
        </div>
      ) : null}

      {/* Step 2 — Personal details */}
      {step === 2 ? (
        <div className="space-y-3">
          <p className="text-base font-medium text-white">Your details</p>
          {isReturningUser ? (
            <p className="text-xs text-zinc-500">Already saved — edit if anything has changed.</p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <label htmlFor="onboarding-full-name" className="space-y-1 text-sm text-zinc-300">
              Full name
              <input
                id="onboarding-full-name"
                required
                aria-required="true"
                className="mt-1 w-full rounded-xl bg-zinc-800 p-3 text-base"
                placeholder="Full name"
                value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              />
            </label>
            <label htmlFor="onboarding-date-of-birth" className="space-y-1 text-sm text-zinc-300">
              Date of birth
              <input
                id="onboarding-date-of-birth"
                required
                aria-required="true"
                className="mt-1 w-full rounded-xl bg-zinc-800 p-3 text-base"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
              />
            </label>
            <label htmlFor="onboarding-weight-kg" className="space-y-1 text-sm text-zinc-300">
              Weight (kg)
              <input
                id="onboarding-weight-kg"
                required
                aria-required="true"
                className="mt-1 w-full rounded-xl bg-zinc-800 p-3 text-base"
                type="number"
                placeholder="e.g. 68"
                value={form.weightKg}
                onChange={(e) => setForm((p) => ({ ...p, weightKg: e.target.value }))}
              />
            </label>
            <label htmlFor="onboarding-height-cm" className="space-y-1 text-sm text-zinc-300">
              Height (cm)
              <input
                id="onboarding-height-cm"
                required
                aria-required="true"
                className="mt-1 w-full rounded-xl bg-zinc-800 p-3 text-base"
                type="number"
                placeholder="e.g. 165"
                value={form.heightCm}
                onChange={(e) => setForm((p) => ({ ...p, heightCm: e.target.value }))}
              />
            </label>
          </div>
        </div>
      ) : null}

      {/* Step 3 — Fitness level */}
      {step === 3 ? (
        <div className="space-y-4">
          <p className="text-base font-medium text-white">What’s your current fitness level?</p>
          <select
            aria-label="Fitness level"
            className="w-full rounded-xl bg-zinc-800 p-3 text-base"
            value={form.fitnessLevel}
            onChange={(e) => setForm((p) => ({ ...p, fitnessLevel: e.target.value }))}
          >
            <option value="beginner">Beginner — I’m just getting started</option>
            <option value="intermediate">Intermediate — I train occasionally</option>
            <option value="advanced">Advanced — I train regularly</option>
          </select>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-coral-500/30 bg-coral-500/10 p-3 text-sm text-zinc-200">
            <input
              type="checkbox"
              className="mt-0.5 h-5 w-5 cursor-pointer accent-coral-400"
              checked={form.postnatal}
              onChange={(e) => setForm((p) => ({ ...p, postnatal: e.target.checked }))}
            />
            <span>
              <span className="font-semibold text-coral-300">I’m postnatal / recently postpartum</span>
              <span className="mt-0.5 block text-zinc-400">
                Forja will prioritise pelvic floor-safe exercises, avoid high-impact moves, and build you back up gently.
              </span>
            </span>
          </label>
        </div>
      ) : null}

      {/* Step 4 — Goals */}
      {step === 4 ? (
        <div className="space-y-3">
          <p className="text-base font-medium text-white">What are your goals? (pick all that apply)</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {goals.map((goal) => (
              <label key={goal} className="flex items-center gap-2 text-sm text-zinc-200">
                <input
                  className="h-5 w-5 cursor-pointer accent-coral-400"
                  type="checkbox"
                  checked={form.goals.includes(goal)}
                  onChange={() => updateArray("goals", goal)}
                />
                {goal}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {/* Step 5 — Days per week */}
      {step === 5 ? (
        <div className="space-y-3">
          <p className="text-base font-medium text-white">How many days per week can you train?</p>
          <p className="text-sm text-zinc-400">Even 2–3 days is brilliant — consistency beats frequency every time.</p>
          <input
            aria-label="Days per week available"
            className="w-full rounded-xl bg-zinc-800 p-3 text-base"
            type="number"
            min={1}
            max={7}
            value={form.daysPerWeek}
            onChange={(e) => setForm((p) => ({ ...p, daysPerWeek: e.target.value }))}
          />
        </div>
      ) : null}

      {/* Step 6 — Session length */}
      {step === 6 ? (
        <div className="space-y-3">
          <p className="text-base font-medium text-white">How long can your sessions be?</p>
          <p className="text-sm text-zinc-400">Be honest — a real 20-minute workout beats an imaginary 60-minute one.</p>
          <select
            aria-label="Preferred session length"
            className="w-full rounded-xl bg-zinc-800 p-3 text-base"
            value={form.sessionLength}
            onChange={(e) => setForm((p) => ({ ...p, sessionLength: e.target.value }))}
          >
            <option value="15">15 minutes — nap-time sprint</option>
            <option value="30">30 minutes — before the day kicks off</option>
            <option value="45">45 minutes — I can carve this out</option>
            <option value="60">60+ minutes — I have proper time</option>
          </select>
        </div>
      ) : null}

      {/* Step 7 — Equipment */}
      {step === 7 ? (
        <div className="space-y-3">
          <p className="text-base font-medium text-white">What equipment do you have access to?</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {equipmentOptions.map((item) => (
              <label key={item} className="flex items-center gap-2 text-sm text-zinc-200">
                <input
                  className="h-5 w-5 cursor-pointer accent-coral-400"
                  type="checkbox"
                  checked={form.equipment.includes(item)}
                  onChange={() => updateArray("equipment", item)}
                />
                {item}
              </label>
            ))}
          </div>
          {form.equipment.includes("other") ? (
            <input
              aria-label="Other equipment"
              className="w-full rounded-xl bg-zinc-800 p-3 text-base"
              placeholder="Describe your equipment"
              value={form.equipmentOther}
              onChange={(e) => setForm((p) => ({ ...p, equipmentOther: e.target.value }))}
            />
          ) : null}
        </div>
      ) : null}

      {/* Step 8 — Health notes */}
      {step === 8 ? (
        <div className="space-y-3">
          <p className="text-base font-medium text-white">Any health notes or injuries? (optional)</p>
          <p className="text-sm text-zinc-400">
            Mention things like a c-section scar, back pain, SPD, or diastasis recti — Forja will work around them.
          </p>
          <textarea
            aria-label="Health notes or injuries"
            className="min-h-28 w-full rounded-xl bg-zinc-800 p-3 text-base"
            placeholder="e.g. 6 months postpartum, c-section, lower back pain"
            value={form.healthNotes}
            onChange={(e) => setForm((p) => ({ ...p, healthNotes: e.target.value }))}
          />
        </div>
      ) : null}

      {/* Plan preview */}
      {showPreview ? (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Your 4-week plan ✨</h3>
          <p className="text-sm text-zinc-400">Here’s what Forja has built for you. Save it to start training.</p>
          {planPreview?.weeks?.map((week) => (
            <div key={week.week} className="space-y-1 rounded-xl bg-zinc-800 p-3">
              <p className="font-semibold text-white">Week {week.week}</p>
              {week.sessions.map((session) => (
                <p key={`${week.week}-${session.day}`} className="text-sm text-zinc-300">
                  {session.day}: {session.focus}
                </p>
              ))}
            </div>
          ))}
          <Button onClick={handleSavePlan} disabled={isLoading}>
            {isLoading ? "Saving…" : "Save plan and get started"}
          </Button>
        </div>
      ) : null}

      {/* Loading skeleton + live status */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-16 w-full" />
          {statusMessage ? (
            <p className="flex items-center gap-2 text-sm text-zinc-400">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-coral-400" />
              {statusMessage}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Error */}
      {errorMessage && !isLoading ? (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3">
          <p className="text-sm text-rose-200">{errorMessage}</p>
        </div>
      ) : null}

      {/* Navigation */}
      {!showPreview ? (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setStep((v) => Math.max(1, v - 1))}
            disabled={step === 1 || isLoading}
          >
            Back
          </Button>
          {step < totalSteps ? (
            <Button onClick={() => setStep((v) => v + 1)} disabled={!canGoNext || isLoading}>
              Continue
            </Button>
          ) : (
            <Button onClick={handleGeneratePreview} disabled={isLoading}>
              {isLoading ? statusMessage || "Building your plan…" : "Generate my plan"}
            </Button>
          )}
        </div>
      ) : null}
    </Card>
  );
}
