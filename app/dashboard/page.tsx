import Link from "next/link";
import { WorkoutCard } from "@/components/WorkoutCard";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Button } from "@/components/ui/Button";
import type { Session } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { markSessionCompleteAction } from "@/app/dashboard/actions";
import { getSessionCompletionErrorMessage } from "@/app/dashboard/completionErrors";
import { ClearCompletionError } from "@/app/dashboard/ClearCompletionError";

function isSessionExercises(value: unknown): value is Session["exercises"] {
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

function extractSessionLength(value: unknown): number | null {
  const plan =
    Array.isArray(value) && value.length > 0
      ? value[0]
      : value;

  if (
    plan &&
    typeof plan === "object" &&
    "session_length_minutes" in plan &&
    typeof plan.session_length_minutes === "number" &&
    Number.isFinite(plan.session_length_minutes)
  ) {
    return plan.session_length_minutes;
  }

  return null;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { error?: string | string[] };
}) {
  const completionError = getSessionCompletionErrorMessage(searchParams?.error);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let sessions: Session[] = [];

  if (user) {
    const { data } = await supabase
      .from("sessions")
      .select("id, day_label, focus, exercises, completed, workout_plans(session_length_minutes)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    sessions = (data ?? []).map((session) => ({
      id: session.id,
      day_label: session.day_label ?? "Session",
      focus: session.focus ?? "Training",
      exercises: isSessionExercises(session.exercises) ? session.exercises : [],
      completed: Boolean(session.completed),
      session_length_minutes: extractSessionLength(session.workout_plans),
    }));
  }

  const completed = sessions.filter((session) => session.completed).length;
  const completedPercentage = sessions.length > 0 ? Math.round((completed / sessions.length) * 100) : 0;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-8 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Weekly dashboard</h1>
          <p className="text-slate-300">Track each session and keep your momentum moving.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/holiday"><Button variant="secondary">Holiday mode</Button></Link>
          <Button>Generate next week</Button>
        </div>
      </header>

      <section className="flex flex-wrap items-center gap-8 rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <div>
          <p className="text-sm text-slate-300">Current week completion</p>
          <p className="text-2xl font-semibold text-slate-100">{completedPercentage}%</p>
        </div>
        <ProgressRing value={completedPercentage} />
      </section>
      {completionError ? (
        <>
          <ClearCompletionError />
          <p className="rounded-md border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {completionError}
          </p>
        </>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <div key={session.id} className="space-y-2">
              <WorkoutCard session={session} completeAction={markSessionCompleteAction} returnPath="/dashboard" />
              <Link className="text-sm text-orange-300 underline" href={`/dashboard/session/${session.id}`}>
                View session details
              </Link>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-300">No sessions yet. Complete onboarding to generate your first plan.</p>
        )}
      </section>
    </main>
  );
}
