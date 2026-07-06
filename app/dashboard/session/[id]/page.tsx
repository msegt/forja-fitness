import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ExerciseItem } from "@/components/ExerciseItem";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Exercise } from "@/types";
import { markSessionCompleteAction } from "@/app/dashboard/actions";
import { getSessionCompletionErrorMessage } from "@/app/dashboard/completionErrors";
import { ClearCompletionError } from "@/app/dashboard/ClearCompletionError";

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

export default async function SessionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
}) {
  const { id } = await params;
  const resolvedSearch = await searchParams;
  const completionError = getSessionCompletionErrorMessage(resolvedSearch?.error);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: session } = await supabase
    .from("sessions")
    .select("id, day_label, focus, exercises, completed")
    .eq("user_id", user.id)
    .eq("id", id)
    .maybeSingle();

  if (!session) notFound();

  const exercises = isExercises(session.exercises) ? session.exercises : [];

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl space-y-5 px-4 py-8">
      <Link href="/dashboard" className="text-sm font-medium text-coral-400 hover:text-coral-300">
        ← Back to dashboard
      </Link>
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{session.day_label ?? "Session"}</p>
        <h1 className="text-3xl font-bold text-white">{session.focus ?? "Workout session"}</h1>
      </header>
      <section className="space-y-3">
        {exercises.map((exercise) => (
          <ExerciseItem key={exercise.name} exercise={exercise} />
        ))}
      </section>
      {completionError ? (
        <>
          <ClearCompletionError />
          <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {completionError}
          </p>
        </>
      ) : null}
      <form action={markSessionCompleteAction}>
        <input type="hidden" name="sessionId" value={id} />
        <input type="hidden" name="returnPath" value={`/dashboard/session/${id}`} />
        <Button type="submit" disabled={Boolean(session.completed)} className="w-full sm:w-auto">
          {session.completed ? "✓ Completed" : "Mark session complete"}
        </Button>
      </form>
    </main>
  );
}
