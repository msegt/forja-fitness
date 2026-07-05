import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ExerciseItem } from "@/components/ExerciseItem";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Exercise } from "@/types";
import { markSessionCompleteAction } from "@/app/dashboard/actions";

function isExercises(value: unknown): value is Exercise[] {
  return (
    Array.isArray(value) &&
    value.every(
      (exercise) =>
        typeof exercise === "object" &&
        exercise !== null &&
        "name" in exercise &&
        "youtube_query" in exercise,
    )
  );
}

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: session } = await supabase
    .from("sessions")
    .select("id, day_label, focus, exercises, completed")
    .eq("user_id", user.id)
    .eq("id", params.id)
    .maybeSingle();

  if (!session) {
    notFound();
  }

  const exercises = isExercises(session.exercises) ? session.exercises : [];

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl space-y-5 px-4 py-8">
      <Link href="/dashboard" className="text-sm text-orange-300 underline">Back to dashboard</Link>
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-400">{session.day_label ?? "Session"}</p>
        <h1 className="text-3xl font-bold text-slate-100">{session.focus ?? "Workout session"}</h1>
      </header>
      <section className="space-y-3">
        {exercises.map((exercise) => (
          <ExerciseItem key={exercise.name} exercise={exercise} />
        ))}
      </section>
      <form action={markSessionCompleteAction}>
        <input type="hidden" name="sessionId" value={params.id} />
        <Button type="submit" disabled={Boolean(session.completed)}>
          {session.completed ? "Completed" : "Mark session complete"}
        </Button>
      </form>
    </main>
  );
}
