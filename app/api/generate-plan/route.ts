import { NextRequest, NextResponse } from "next/server";
import { generateWorkoutPlan } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";
import { loadUserKeyConfig } from "@/lib/ai-client";

const RETRY_DELAYS_MS = [2000, 4000, 6000, 8000];

function isRetryable(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes("503") || msg.includes("high demand") || msg.includes("429") || msg.includes("overloaded");
}
function sleep(ms: number) { return new Promise<void>((r) => setTimeout(r, ms)); }

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Record<string, unknown>;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userKey = user ? await loadUserKeyConfig(user.id, supabase as Parameters<typeof loadUserKeyConfig>[1]) : { provider: null, apiKey: null };

  const daysPerWeek = typeof body.daysPerWeek === "number" ? body.daysPerWeek : 3;

  let plan;
  let lastError: unknown;
  for (let i = 0; i <= RETRY_DELAYS_MS.length; i++) {
    try {
      plan = await generateWorkoutPlan(body, daysPerWeek, userKey);
      break;
    } catch (err) {
      lastError = err;
      if (!isRetryable(err) || i === RETRY_DELAYS_MS.length) {
        return NextResponse.json(
          { error: "Forja\u2019s AI model is still very busy after several attempts. Please wait a minute and try again." },
          { status: 503 },
        );
      }
      await sleep(RETRY_DELAYS_MS[i]);
    }
  }

  if (!plan) {
    return NextResponse.json({ error: String(lastError) }, { status: 503 });
  }

  if (user) {
    const weeks = (plan as { weeks: unknown[] }).weeks;
    const allSessions = weeks.flatMap((w: unknown) => {
      const week = w as { week: number; sessions: { day: string; focus: string; exercises: unknown[] }[] };
      return week.sessions.map((s, idx) => ({
        user_id: user.id,
        week_number: week.week,
        day_label: s.day ?? `Day ${idx + 1}`,
        focus: s.focus,
        exercises: s.exercises,
        completed: false,
      }));
    });

    const { data: existingPlan } = await supabase
      .from("workout_plans")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingPlan) {
      await supabase.from("sessions").delete().eq("user_id", user.id);
    }

    await supabase.from("workout_plans").upsert({
      user_id: user.id,
      days_per_week: daysPerWeek,
      gemini_raw_plan: plan,
    });

    if (allSessions.length > 0) {
      await supabase.from("sessions").insert(allSessions);
    }

    await supabase.from("profiles").upsert({
      id: user.id,
      full_name: body.fullName as string ?? null,
      date_of_birth: body.dateOfBirth as string ?? null,
      weight_kg: body.weightKg ? Number(body.weightKg) : null,
      height_cm: body.heightCm ? Number(body.heightCm) : null,
      fitness_level: body.fitnessLevel as string ?? null,
      goals: body.goals ?? [],
      health_notes: body.healthNotes as string ?? null,
    });
  }

  return NextResponse.json({ plan });
}
