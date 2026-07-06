"use client";

import { useState } from "react";
import type { Exercise } from "@/types";
import { Card } from "@/components/ui/Card";
import { MuscleDiagram } from "@/components/MuscleDiagram";

export function ExerciseItem({ exercise }: { exercise: Exercise }) {
  const [done, setDone] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const details = [
    exercise.sets ? `${exercise.sets} sets` : null,
    exercise.reps ? exercise.reps : null,
    exercise.duration ? exercise.duration : null,
    exercise.rest ? `Rest ${exercise.rest}` : null,
  ].filter(Boolean);

  return (
    <Card className={`space-y-3 transition-opacity ${done ? "opacity-60" : ""}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className={`text-base font-semibold ${done ? "line-through text-zinc-400" : "text-white"}`}>
            {exercise.name}
          </h4>
          {details.length > 0 ? (
            <p className="mt-0.5 text-sm font-medium text-zinc-400">{details.join(" • ")}</p>
          ) : null}
        </div>
        <label className="flex min-h-[44px] min-w-[44px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl bg-zinc-800/60 text-xs text-zinc-400 transition-colors hover:bg-zinc-700/60">
          <input
            type="checkbox"
            className="h-5 w-5 cursor-pointer accent-coral-400"
            checked={done}
            onChange={() => setDone((v) => !v)}
          />
          <span className="text-[10px]">{done ? "Done ✓" : "Done"}</span>
        </label>
      </div>

      {/* Coaching tip */}
      {exercise.coaching_tip ? (
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm italic text-amber-300">
          💡 {exercise.coaching_tip}
        </p>
      ) : null}

      {/* Expand/collapse instructions + muscle diagram */}
      <button
        type="button"
        onClick={() => setShowDetail((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg px-1 py-1 text-sm font-medium text-coral-400 hover:text-coral-300"
      >
        <span>{showDetail ? "Hide details" : "How to do this exercise"}</span>
        <span className="text-xs">{showDetail ? "▲" : "▼"}</span>
      </button>

      {showDetail ? (
        <div className="space-y-4 pt-1">
          {/* Muscle diagram */}
          {exercise.muscles && exercise.muscles.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Muscles targeted</p>
              <MuscleDiagram muscles={exercise.muscles} />
            </div>
          ) : null}

          {/* Step-by-step instructions */}
          {exercise.instructions && exercise.instructions.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">How to perform</p>
              <ol className="space-y-2">
                {exercise.instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-zinc-300">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-coral-500/20 text-xs font-bold text-coral-400">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {/* YouTube link */}
          {exercise.youtube_url ? (
            <a
              href={exercise.youtube_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-coral-500/30 bg-coral-500/10 px-4 py-2 text-sm font-medium text-coral-300 transition-colors hover:bg-coral-500/20"
            >
              ▶ Watch guidance video
            </a>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
