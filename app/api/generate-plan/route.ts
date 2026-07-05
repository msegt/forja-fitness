import { NextRequest, NextResponse } from "next/server";
import { generateWorkoutPlan } from "@/lib/gemini";
import { searchYoutubeVideo } from "@/lib/youtube";
import { createClient } from "@/lib/supabase/server";
import type { WorkoutPlan } from "@/types";

export async function POST(request: NextRequest) {
  const profile = (await request.json()) as Record<string, unknown> & { savePlan?: boolean; plan?: WorkoutPlan };
  const daysPerWeek = Number(profile.daysPerWeek ?? 3);
  const sessionLengthInput = String(profile.sessionLength ?? "30");
  const sessionLengthMinutes = sessionLengthInput === "60+" ? 60 : Number(sessionLengthInput);

  try {
    const plan = profile.savePlan && profile.plan ? profile.plan : await generateWorkoutPlan(profile, daysPerWeek);

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
                  if (process.env.NODE_ENV !== "production") {
                    console.warn(`YouTube lookup failed for query: ${exercise.youtube_query}`);
                  }
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const firstWeek = weeks[0];
        const { data: planRow } = await supabase
          .from("workout_plans")
          .insert({
            user_id: user.id,
            week_number: firstWeek?.week ?? 1,
            days_per_week: daysPerWeek,
            session_length_minutes: Number.isFinite(sessionLengthMinutes) ? sessionLengthMinutes : 30,
            equipment: Array.isArray(profile.equipment) ? profile.equipment : [],
            gemini_raw_plan: { weeks },
          })
          .select("id")
          .single();

        if (planRow?.id && firstWeek) {
          await supabase.from("sessions").insert(
            firstWeek.sessions.map((session) => ({
              plan_id: planRow.id,
              user_id: user.id,
              day_label: session.day,
              focus: session.focus,
              exercises: session.exercises,
            })),
          );
        }
      }
    }

    return NextResponse.json({ plan: { weeks } });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate plan", ...(process.env.NODE_ENV !== "production" ? { detail } : {}) },
      { status: 500 },
    );
  }
}
