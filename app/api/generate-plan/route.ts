import { NextRequest, NextResponse } from "next/server";
import { generateWorkoutPlan } from "@/lib/gemini";
import { searchYoutubeVideo } from "@/lib/youtube";

export async function POST(request: NextRequest) {
  const profile = (await request.json()) as Record<string, unknown>;
  const daysPerWeek = Number(profile.daysPerWeek ?? 3);

  try {
    const plan = await generateWorkoutPlan(profile, daysPerWeek);

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
                  console.warn(`YouTube lookup failed for query: ${exercise.youtube_query}`);
                  return exercise;
                }
              }),
            ),
          })),
        ),
      })),
    );

    return NextResponse.json({ plan: { weeks } });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate plan", detail: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
