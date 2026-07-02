"use client";

import { useState } from "react";
import type { Exercise } from "@/types";
import { Card } from "@/components/ui/Card";

export function ExerciseItem({ exercise }: { exercise: Exercise }) {
  const [done, setDone] = useState(false);

  return (
    <Card className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-base font-semibold text-slate-100">{exercise.name}</h4>
        <label className="flex items-center gap-2 text-xs text-slate-300">
          <input type="checkbox" checked={done} onChange={() => setDone((value) => !value)} />
          Done
        </label>
      </div>
      <p className="text-sm text-slate-300">
        {exercise.sets ? `${exercise.sets} sets` : ""} {exercise.reps ? `• ${exercise.reps}` : ""} {exercise.duration ? `• ${exercise.duration}` : ""} {exercise.rest ? `• Rest ${exercise.rest}` : ""}
      </p>
      {exercise.coaching_tip ? <p className="text-sm italic text-orange-300">{exercise.coaching_tip}</p> : null}
      {exercise.youtube_url ? (
        <a href={exercise.youtube_url} target="_blank" rel="noreferrer" className="text-sm text-orange-400 underline">
          Watch guidance video
        </a>
      ) : null}
    </Card>
  );
}
