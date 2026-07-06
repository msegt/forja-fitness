import { NextRequest, NextResponse } from "next/server";
import { generateWorkoutPlan } from "@/lib/gemini";
import { searchYoutubeVideo } from "@/lib/youtube";
import { createClient } from "@/lib/supabase/server";
import type { WorkoutPlan } from "@/types";

const DEFAULT_SESSION_LENGTH_MINUTES = 30;

// Delay between each retry attempt (ms). Total wait before giving up: ~18 s.
const RETRY_DELAYS_MS = [2000, 4000, 6000, 8000];

function isRetryable(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("503") ||
    msg.includes("Service Unavailable") ||
    msg.includes("currently experiencing high demand") ||
    msg.includes("429") ||
    msg.includes("temporarily unavailable")
  );
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function generateWithRetry(
  profile: Record<string, unknown>,
  daysPerWeek: number,
): Promise<{ plan: WorkoutPlan; attempts: number }> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const plan = await generateWorkoutPlan(profile, daysPerWeek);
      return { plan, attempts: attempt + 1 };
    } catch (err) {
      lastError = err;
      if (!isRetryable(err) || attempt === RETRY_DELAYS_MS.length) throw err;
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }

  throw lastError;
}

export async function POST(request: NextRequest) {
  const profile = (await request.json()) as Record<string, unknown> & {
    savePlan?: boolean;
    plan?: WorkoutPlan;
  };
  const daysPerWeek = Number(profile.daysPerWeek ?? 3);
  const sessionLengthMinutes = Number(profile.sessionLength ?? DEFAULT_SESSION_LENGTH_MINUTES);

  try {
    const { plan, attempts } =
      profile.savePlan && profile.plan
        ? { plan: profile.plan, attempts: 1 }
        : await generateWithRetry(profile, daysPerWeek);

    const weeks = await Promise.all(
      plan.weeks.map(async (week) => ({
        ...week,
        sessions: await Promise.all(
          week.sessions.map(async (session) => ({
            ...session,
            exercises: await Promise.all(
              session.exercises.map(async (exercise) => {
                try {
                  const { videoId, thumbnail } = await searchYoutubeVideo(exercise.youtube_query);
                  return {
                    ...exercise,
                    youtube_url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : undefined,
                    youtube_thumbnail: thumbnail,
                  };
                } catch {
                  return exercise;
                }
              }),
            ),
          })),
        ),
      })),
    );

    if (profile.savePlan) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Persist updated profile fields so regenerate doesn't need to re-ask
        await supabase.from("profiles").upsert({
          id: user.id,
          full_name: typeof profile.fullName === "string" ? profile.fullName : null,
          date_of_birth: typeof profile.dateOfBirth === "string" ? profile.dateOfBirth : null,
          weight_kg: profile.weightKg ? Number(profile.weightKg) : null,
          height_cm: profile.heightCm ? Number(profile.heightCm) : null,
          fitness_level: typeof profile.fitnessLevel === "string" ? profile.fitnessLevel : null,
          goals: Array.isArray(profile.goals) ? profile.goals : [],
          health_notes: typeof profile.healthNotes === "string" ? profile.healthNotes : null,
        });

        const { data: planRow } = await supabase
          .from("workout_plans")
          .insert({
            user_id: user.id,
            week_number: 1,
            days_per_week: daysPerWeek,
            session_length_minutes: Number.isFinite(sessionLengthMinutes)
              ? sessionLengthMinutes
              : DEFAULT_SESSION_LENGTH_MINUTES,
            equipment: Array.isArray(profile.equipment) ? profile.equipment : [],
            gemini_raw_plan: { weeks },
          })
          .select("id")
          .single();

        if (planRow?.id) {
          const allSessions = weeks.flatMap((week) =>
            week.sessions.map((session) => ({
              plan_id: planRow.id,
              user_id: user.id,
              day_label: `Week ${week.week} – ${session.day}`,
              focus: session.focus,
              exercises: session.exercises,
            })),
          );
          await supabase.from("sessions").insert(allSessions);
        }
      }
    }

    return NextResponse.json({ plan: { weeks }, attempts });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("[generate-plan] error after retries:", detail);

    const isOverloaded =
      detail.includes("503") ||
      detail.includes("high demand") ||
      detail.includes("429");

    return NextResponse.json(
      {
        error: isOverloaded
          ? "Forja’s AI model is still very busy after several attempts. Please wait a minute and try again — it should settle down shortly."
          : `Unable to generate plan: ${detail}`,
      },
      { status: isOverloaded ? 503 : 500 },
    );
  }
}
