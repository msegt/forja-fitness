"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { WorkoutCard } from "@/components/WorkoutCard";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Button } from "@/components/ui/Button";
import type { Session } from "@/types";

const sampleSessions: Session[] = [
  {
    id: "session-1",
    day_label: "Day 1",
    focus: "Upper body strength",
    completed: false,
    exercises: [
      { name: "Push-up", sets: 3, reps: "8-10", youtube_query: "push up technique" },
      { name: "Dumbbell row", sets: 3, reps: "10", youtube_query: "dumbbell row form" },
      { name: "Plank", duration: "45s", youtube_query: "plank exercise" },
      { name: "Band pull-apart", sets: 2, reps: "12", youtube_query: "band pull apart" },
    ],
  },
  {
    id: "session-2",
    day_label: "Day 2",
    focus: "Lower body and core",
    completed: false,
    exercises: [
      { name: "Goblet squat", sets: 3, reps: "10", youtube_query: "goblet squat" },
      { name: "Split squat", sets: 3, reps: "8 each side", youtube_query: "split squat form" },
      { name: "Glute bridge", sets: 3, reps: "12", youtube_query: "glute bridge" },
      { name: "Dead bug", sets: 2, reps: "10 each side", youtube_query: "dead bug exercise" },
    ],
  },
  {
    id: "session-3",
    day_label: "Day 3",
    focus: "Cardio conditioning",
    completed: false,
    exercises: [
      { name: "March in place", duration: "3 min", youtube_query: "march in place cardio" },
      { name: "Step-ups", duration: "2 min", youtube_query: "step ups exercise" },
      { name: "Mountain climber", duration: "45s", youtube_query: "mountain climbers" },
      { name: "Shadow boxing", duration: "3 min", youtube_query: "shadow boxing beginner" },
    ],
  },
];

export default function DashboardPage() {
  const [sessions, setSessions] = useState(sampleSessions);

  const completedPercentage = useMemo(() => {
    const completed = sessions.filter((session) => session.completed).length;
    return Math.round((completed / sessions.length) * 100);
  }, [sessions]);

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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sessions.map((session) => (
          <div key={session.id} className="space-y-2">
            <WorkoutCard
              session={session}
              onComplete={(sessionId) =>
                setSessions((current) =>
                  current.map((item) => (item.id === sessionId ? { ...item, completed: true } : item)),
                )
              }
            />
            <Link className="text-sm text-orange-300 underline" href={`/dashboard/session/${session.id}`}>
              View session details
            </Link>
          </div>
        ))}
      </section>
    </main>
  );
}
