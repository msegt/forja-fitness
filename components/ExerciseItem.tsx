"use client";

import { useState } from "react";
import type { Exercise } from "@/types";
import { Card } from "@/components/ui/Card";

export function ExerciseItem({ exercise }: { exercise: Exercise }) {
  const [done, setDone] = useState(false);
  const details = [
    exercise.sets ? `${exercise.sets} sets` : null,
    exercise.reps ? exercise.reps : null,
    exercise.duration ? exercise.duration : null,
    exercise.rest ? `Rest ${exercise.rest}` : null,
  ].filter(Boolean);

  return (
    <Card className={`space-y-2 transition-opacity ${done ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <h4 className={`text-base font-semibold ${done ? "line-through text-zinc-400" : "text-white"}`}>
          {exercise.name}
        </h4>
        <label className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center gap-2 text-xs text-zinc-400">
          <input
            type="checkbox"
            className="h-5 w-5 cursor-pointer accent-coral-400"
            checked={done}
            onChange={() => setDone((v) => !v)}
          />
          <span>{done ? "Done \u2713" : "Done"}</span>
        </label>
      </div>
      {details.length > 0 ? (
        <p className="text-sm font-medium text-zinc-300">{details.join(" \u2022 ")}</p>
      ) : null}
      {exercise.coaching_tip ? (
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm italic text-amber-300">{exercise.coaching_tip}</p>
      ) : null}
      {exercise.youtube_url ? (
        <a
          href={exercise.youtube_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-coral-400 underline-offset-2 hover:underline"
        >
          <span>\u25B6\uFE0F</span> Watch guidance video
        </a>
      ) : null}
    </Card>
  );
}
