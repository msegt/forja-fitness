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
];

const equipmentOptions = ["none", "resistance bands", "dumbbells", "kettlebell", "pull-up bar", "gym access", "other"];

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [planPreview, setPlanPreview] = useState<WorkoutPlan | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    dateOfBirth: "",
    weightKg: "",
    heightCm: "",
    fitnessLevel: "beginner",
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

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? "Unable to generate your plan right now. Please try again.");
      }

      const data = (await response.json()) as { plan: WorkoutPlan };
      setPlanPreview(data.plan);
      setStep(9);
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
      <p className="text-xs uppercase tracking-wide text-slate-400">Step {step} of 9</p>
      {step === 1 ? <p className="text-sm text-slate-200">Welcome to Forja. We’ll shape a training programme that fits your life.</p> : null}
      {step === 2 ? (
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
      ) : null}
      {step === 3 ? (
        <select aria-label="Fitness level" className="w-full rounded-lg bg-slate-800 p-2 text-sm" value={form.fitnessLevel} onChange={(event) => setForm((prev) => ({ ...prev, fitnessLevel: event.target.value }))}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      ) : null}
      {step === 4 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {goals.map((goal) => (
            <label key={goal} className="flex items-center gap-2 text-sm text-slate-200">
              <input type="checkbox" checked={form.goals.includes(goal)} onChange={() => updateArray("goals", goal)} />
              {goal}
            </label>
          ))}
        </div>
      ) : null}
      {step === 5 ? <input aria-label="Days per week available" className="w-full rounded-lg bg-slate-800 p-2 text-sm" type="number" min={1} max={7} value={form.daysPerWeek} onChange={(event) => setForm((prev) => ({ ...prev, daysPerWeek: event.target.value }))} /> : null}
      {step === 6 ? (
        <select aria-label="Preferred session length" className="w-full rounded-lg bg-slate-800 p-2 text-sm" value={form.sessionLength} onChange={(event) => setForm((prev) => ({ ...prev, sessionLength: event.target.value }))}>
          <option value="15">15 minutes</option>
          <option value="30">30 minutes</option>
          <option value="45">45 minutes</option>
          <option value="60+">60+ minutes</option>
        </select>
      ) : null}
      {step === 7 ? (
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {equipmentOptions.map((item) => (
              <label key={item} className="flex items-center gap-2 text-sm text-slate-200">
                <input type="checkbox" checked={form.equipment.includes(item)} onChange={() => updateArray("equipment", item)} />
                {item}
              </label>
            ))}
          </div>
          {form.equipment.includes("other") ? (
            <input aria-label="Other equipment" className="w-full rounded-lg bg-slate-800 p-2 text-sm" placeholder="Other equipment" value={form.equipmentOther} onChange={(event) => setForm((prev) => ({ ...prev, equipmentOther: event.target.value }))} />
          ) : null}
        </div>
      ) : null}
      {step === 8 ? <textarea aria-label="Health notes or injuries" className="min-h-24 w-full rounded-lg bg-slate-800 p-2 text-sm" placeholder="Health notes or injuries (optional)" value={form.healthNotes} onChange={(event) => setForm((prev) => ({ ...prev, healthNotes: event.target.value }))} /> : null}
      {step === 9 ? (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-100">Your preview plan</h3>
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
          <Button onClick={handleSavePlan} disabled={isLoading}>Save and continue</Button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : null}
      {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}

      {step < 9 ? (
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setStep((value) => Math.max(1, value - 1))} disabled={step === 1}>
            Back
          </Button>
          {step < 8 ? (
            <Button onClick={() => setStep((value) => value + 1)} disabled={!canGoNext}>
              Continue
            </Button>
          ) : (
            <Button onClick={handleGeneratePreview} disabled={isLoading}>
              Generate plan
            </Button>
          )}
        </div>
      ) : null}
    </Card>
  );
}
