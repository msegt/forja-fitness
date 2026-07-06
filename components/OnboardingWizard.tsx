"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

const equipmentOptions = ["none", "resistance bands", "dumbbells", "kettlebell", "pull-up bar", "gym access", "other"];
const totalSteps = 8;

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [planPreview, setPlanPreview] = useState<WorkoutPlan | null>(null);
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

  const canGoNext = useMemo(() => {
    if (step === 2) {
      return Boolean(form.fullName && form.dateOfBirth && form.weightKg && form.heightCm);
    }
    if (step === 4) {
      return form.goals.length > 0;
    }
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

      const payload = (await response.json().catch(() => ({}))) as { plan?: WorkoutPlan; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to generate your plan right now. Please try again.");
      }

      if (!payload.plan) {
        throw new Error("No plan was returned by the server. Please try again.");
      }

      setPlanPreview(payload.plan);
      setShowPreview(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong while generating your plan.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSavePlan() {
    if (!planPreview) {
      return;
    }

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
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    setForm((prev) => ({ ...prev, [field]: next }));
  };

  return (
    <Card className="mx-auto w-full max-w-2xl space-y-5">
      {!showPreview ? <p className="text-xs uppercase tracking-wide text-slate-400">Step {step} of {totalSteps}</p> : null}
      {step === 1 ? (
        <div className="space-y-3">
          <p className="text-base font-medium text-slate-100">Welcome to Forja 👋</p>
          <p className="text-sm text-slate-300">
            We&apos;ll build a training programme that genuinely fits around your life — short enough to squeeze in during nap time, effective enough to make you feel strong again.
          </p>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="space-y-3">
          <p className="text-base font-medium text-slate-100">Tell us about yourself</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label htmlFor="onboarding-full-name" className="space-y-1 text-sm text-slate-300">
              Full name
              <input id="onboarding-full-name" required aria-required="true" className="mt-1 w-full rounded-lg bg-slate-800 p-2 text-sm" placeholder="Full name" value={form.fullName} onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))} />
            </label>
            <label htmlFor="onboarding-date-of-birth" className="space-y-1 text-sm text-slate-300">
              Date of birth
              <input id="onboarding-date-of-birth" required aria-required="true" className="mt-1 w-full rounded-lg bg-slate-800 p-2 text-sm" type="date" value={form.dateOfBirth} onChange={(event) => setForm((prev) => ({ ...prev, dateOfBirth: event.target.value }))} />
            </label>
            <label htmlFor="onboarding-weight-kg" className="space-y-1 text-sm text-slate-300">
              Weight (kg)
              <input id="onboarding-weight-kg" required aria-required="true" className="mt-1 w-full rounded-lg bg-slate-800 p-2 text-sm" type="number" placeholder="Weight (kg)" value={form.weightKg} onChange={(event) => setForm((prev) => ({ ...prev, weightKg: event.target.value }))} />
            </label>
            <label htmlFor="onboarding-height-cm" className="space-y-1 text-sm text-slate-300">
              Height (cm)
              <input id="onboarding-height-cm" required aria-required="true" className="mt-1 w-full rounded-lg bg-slate-800 p-2 text-sm" type="number" placeholder="Height (cm)" value={form.heightCm} onChange={(event) => setForm((prev) => ({ ...prev, heightCm: event.target.value }))} />
            </label>
          </div>
        </div>
      ) : null}
      {step === 3 ? (
        <div className="space-y-4">
          <p className="text-base font-medium text-slate-100">What&apos;s your current fitness level?</p>
          <select aria-label="Fitness level" className="w-full rounded-lg bg-slate-800 p-2 text-sm" value={form.fitnessLevel} onChange={(event) => setForm((prev) => ({ ...prev, fitnessLevel: event.target.value }))}>
            <option value="beginner">Beginner — I&apos;m just getting started</option>
            <option value="intermediate">Intermediate — I train occasionally</option>
            <option value="advanced">Advanced — I train regularly</option>
          </select>
          <label className="flex items-start gap-3 rounded-lg border border-orange-400/30 bg-orange-500/10 p-3 text-sm text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 cursor-pointer accent-orange-400"
              checked={form.postnatal}
              onChange={(event) => setForm((prev) => ({ ...prev, postnatal: event.target.checked }))}
            />
            <span>
              <span className="font-medium text-orange-200">I&apos;m postnatal / recently postpartum</span>
              <span className="block mt-0.5 text-slate-400">Forja will prioritise pelvic floor-safe exercises, avoid high-impact moves, and build you back up gently.</span>
            </span>
          </label>
        </div>
      ) : null}
      {step === 4 ? (
        <div className="space-y-3">
          <p className="text-base font-medium text-slate-100">What are your goals? (pick all that apply)</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {goals.map((goal) => (
              <label key={goal} className="flex items-center gap-2 text-sm text-slate-200">
                <input className="h-4 w-4 cursor-pointer accent-orange-400" type="checkbox" checked={form.goals.includes(goal)} onChange={() => updateArray("goals", goal)} />
                {goal}
              </label>
            ))}
          </div>
        </div>
      ) : null}
      {step === 5 ? (
        <div className="space-y-3">
          <p className="text-base font-medium text-slate-100">How many days per week can you train?</p>
          <p className="text-sm text-slate-400">Even 2–3 days is brilliant — consistency beats frequency every time.</p>
          <input aria-label="Days per week available" className="w-full rounded-lg bg-slate-800 p-2 text-sm" type="number" min={1} max={7} value={form.daysPerWeek} onChange={(event) => setForm((prev) => ({ ...prev, daysPerWeek: event.target.value }))} />
        </div>
      ) : null}
      {step === 6 ? (
        <div className="space-y-3">
          <p className="text-base font-medium text-slate-100">How long can your sessions be?</p>
          <p className="text-sm text-slate-400">Be honest — a real 20-minute workout beats an imaginary 60-minute one.</p>
          <select aria-label="Preferred session length" className="w-full rounded-lg bg-slate-800 p-2 text-sm" value={form.sessionLength} onChange={(event) => setForm((prev) => ({ ...prev, sessionLength: event.target.value }))}>
            <option value="15">15 minutes — nap-time sprint</option>
            <option value="30">30 minutes — before the day kicks off</option>
            <option value="45">45 minutes — I can carve this out</option>
            <option value="60">60+ minutes — I have proper time</option>
          </select>
        </div>
      ) : null}
      {step === 7 ? (
        <div className="space-y-3">
          <p className="text-base font-medium text-slate-100">What equipment do you have access to?</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {equipmentOptions.map((item) => (
              <label key={item} className="flex items-center gap-2 text-sm text-slate-200">
                <input className="h-4 w-4 cursor-pointer accent-orange-400" type="checkbox" checked={form.equipment.includes(item)} onChange={() => updateArray("equipment", item)} />
                {item}
              </label>
            ))}
          </div>
          {form.equipment.includes("other") ? (
            <input aria-label="Other equipment" className="w-full rounded-lg bg-slate-800 p-2 text-sm" placeholder="Other equipment" value={form.equipmentOther} onChange={(event) => setForm((prev) => ({ ...prev, equipmentOther: event.target.value }))} />
          ) : null}
        </div>
      ) : null}
      {step === 8 ? (
        <div className="space-y-3">
          <p className="text-base font-medium text-slate-100">Any health notes or injuries? (optional)</p>
          <p className="text-sm text-slate-400">Mention things like a c-section scar, back pain, SPD, or diastasis recti — Forja will work around them.</p>
          <textarea aria-label="Health notes or injuries" className="min-h-24 w-full rounded-lg bg-slate-800 p-2 text-sm" placeholder="e.g. 6 months postpartum, c-section, lower back pain" value={form.healthNotes} onChange={(event) => setForm((prev) => ({ ...prev, healthNotes: event.target.value }))} />
        </div>
      ) : null}
      {showPreview ? (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-100">Your 4-week plan preview ✨</h3>
          <p className="text-sm text-slate-400">Here&apos;s what Forja has built for you. Save it to start training.</p>
          {planPreview?.weeks?.map((week) => (
            <div key={week.week} className="space-y-1 rounded-lg bg-slate-800 p-3">
              <p className="font-semibold text-slate-100">Week {week.week}</p>
              {week.sessions.map((session) => (
                <p key={`${week.week}-${session.day}`} className="text-sm text-slate-300">
                  {session.day}: {session.focus}
                </p>
              ))}
            </div>
          ))}
          <Button onClick={handleSavePlan} disabled={isLoading}>Save plan and get started</Button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : null}
      {errorMessage ? (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-4 py-3">
          <p className="text-sm text-rose-200">{errorMessage}</p>
        </div>
      ) : null}

      {!showPreview ? (
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setStep((value) => Math.max(1, value - 1))} disabled={step === 1}>
            Back
          </Button>
          {step < totalSteps ? (
            <Button onClick={() => setStep((value) => value + 1)} disabled={!canGoNext}>
              Continue
            </Button>
          ) : (
            <Button onClick={handleGeneratePreview} disabled={isLoading}>
              {isLoading ? "Building your plan…" : "Generate my plan"}
            </Button>
          )}
        </div>
      ) : null}
    </Card>
  );
}
