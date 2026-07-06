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

function getGreeting(name: string | null): string {
  const hour = new Date().getHours();
  const first = name ? name.split(" ")[0] : null;
  const suffix = first ? `, ${first}` : "";
  if (hour < 12) return `Good morning${suffix} \uD83C\uDF05`;
  if (hour < 17) return `Good afternoon${suffix} \u2600\uFE0F`;
  return `Good evening${suffix} \uD83C\uDF19`;
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
  let profileName: string | null = null;

  if (user) {
    const [{ data: sessionData }, { data: profile }] = await Promise.all([
      supabase
        .from("sessions")
        .select("id, day_label, focus, exercises, completed, workout_plans(session_length_minutes)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    ]);

    profileName = profile?.full_name ?? null;
    sessions = (sessionData ?? []).map((session) => ({
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

  // Group sessions into weeks using Array.from to avoid downlevelIteration issues
  const weekMap = new Map<string, Session[]>();
  for (const session of sessions) {
    const match = session.day_label.match(/^(Week \d+)/i);
    const key = match ? match[1] : "Sessions";
    if (!weekMap.has(key)) weekMap.set(key, []);
    weekMap.get(key)!.push(session);
  }
  const weekGroups: { label: string; sessions: Session[] }[] = Array.from(weekMap.entries()).map(
    ([label, wSessions]) => ({ label, sessions: wSessions }),
  );

  const greeting = getGreeting(profileName);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-8 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">{greeting}</h1>
          <p className="text-slate-300">Every session counts. Let&apos;s keep the momentum going.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/chat"><Button variant="secondary">Ask Forja</Button></Link>
          <Link href="/holiday"><Button variant="secondary">Holiday mode</Button></Link>
          <Link href="/onboarding"><Button variant="secondary">Regenerate plan</Button></Link>
        </div>
      </header>

      {sessions.length > 0 ? (
        <section className="flex flex-wrap items-center gap-8 rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <div>
            <p className="text-sm text-slate-300">Overall plan completion</p>
            <p className="text-2xl font-semibold text-slate-100">{completedPercentage}%</p>
            <p className="text-xs text-slate-500 mt-1">{completed} of {sessions.length} sessions done</p>
          </div>
          <ProgressRing value={completedPercentage} />
        </section>
      ) : null}

      {completionError ? (
        <>
          <ClearCompletionError />
          <p className="rounded-md border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {completionError}
          </p>
        </>
      ) : null}

      {sessions.length > 0 ? (
        <div className="space-y-8">
          {weekGroups.map(({ label, sessions: wSessions }) => (
            <section key={label}>
              <h2 className="mb-3 text-lg font-semibold text-slate-200">{label}</h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {wSessions.map((session) => (
                  <div key={session.id} className="space-y-2">
                    <WorkoutCard session={session} completeAction={markSessionCompleteAction} returnPath="/dashboard" />
                    <Link className="text-sm text-orange-300 underline" href={`/dashboard/session/${session.id}`}>
                      View exercises
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 space-y-3">
          <p className="text-base font-medium text-slate-100">No sessions yet \u2014 let&apos;s change that! \uD83D\uDCAA</p>
          <p className="text-sm text-slate-300">
            Answer a few quick questions and Forja will build your first four-week programme, tailored to how much time you actually have.
          </p>
          <Link href="/onboarding"><Button>Build my plan</Button></Link>
        </div>
      )}
    </main>
  );
}
