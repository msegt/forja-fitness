"use client";

import { useState } from "react";
import type { Exercise } from "@/types";
import { Card } from "@/components/ui/Card";
import { MuscleDiagram } from "@/components/MuscleDiagram";

type DetailState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; instructions: string[]; muscles: string[] };

export function ExerciseItem({ exercise }: { exercise: Exercise }) {
  const [done, setDone] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detail, setDetail] = useState<DetailState>(() => {
    // If the exercise already has data (new plan), start ready immediately
    if (
      Array.isArray(exercise.instructions) &&
      exercise.instructions.length > 0 &&
      Array.isArray(exercise.muscles) &&
      exercise.muscles.length > 0
    ) {
      return {
        status: "ready",
        instructions: exercise.instructions,
        muscles: exercise.muscles,
      };
    }
    return { status: "idle" };
  });

  const metaDetails = [
    exercise.sets ? `${exercise.sets} sets` : null,
    exercise.reps ?? null,
    exercise.duration ?? null,
    exercise.rest ? `Rest ${exercise.rest}` : null,
  ].filter(Boolean);

  async function handleToggle() {
    const opening = !showDetail;
    setShowDetail(opening);

    // Fetch lazily on first open if data is missing
    if (opening && detail.status === "idle") {
      setDetail({ status: "loading" });
      try {
        const res = await fetch("/api/exercise-detail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: exercise.name }),
        });
        const payload = (await res.json()) as {
          instructions?: string[];
          muscles?: string[];
          error?: string;
        };
        if (!res.ok || payload.error) {
          setDetail({ status: "error", message: payload.error ?? "Could not load details" });
        } else {
          setDetail({
            status: "ready",
            instructions: payload.instructions ?? [],
            muscles: payload.muscles ?? [],
          });
        }
      } catch {
        setDetail({ status: "error", message: "Network error — please try again" });
      }
    }
  }

  return (
    <Card className={`space-y-3 transition-opacity ${done ? "opacity-60" : ""}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className={`text-base font-semibold ${done ? "line-through text-zinc-400" : "text-white"}`}>
            {exercise.name}
          </h4>
          {metaDetails.length > 0 ? (
            <p className="mt-0.5 text-sm text-zinc-400">{metaDetails.join(" • ")}</p>
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

      {/* Toggle */}
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between rounded-lg px-1 py-1 text-sm font-medium text-coral-400 hover:text-coral-300"
      >
        <span>{showDetail ? "Hide details" : "How to do this exercise"}</span>
        <span className="text-xs">{showDetail ? "▲" : "▼"}</span>
      </button>

      {/* Detail panel */}
      {showDetail ? (
        <div className="space-y-4 pt-1">
          {/* Loading */}
          {detail.status === "loading" ? (
            <div className="space-y-2">
              <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-700" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-700" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-700" />
              <p className="text-xs text-zinc-500">Loading exercise details…</p>
            </div>
          ) : null}

          {/* Error */}
          {detail.status === "error" ? (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2">
              <p className="text-sm text-rose-300">{detail.message}</p>
              <button
                type="button"
                className="mt-1 text-xs text-coral-400 hover:text-coral-300"
                onClick={() => { setDetail({ status: "idle" }); void handleToggle(); }}
              >
                Try again
              </button>
            </div>
          ) : null}

          {/* Ready */}
          {detail.status === "ready" ? (
            <>
              {detail.muscles.length > 0 ? (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Muscles targeted</p>
                  <MuscleDiagram muscles={detail.muscles} />
                </div>
              ) : null}

              {detail.instructions.length > 0 ? (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">How to perform</p>
                  <ol className="space-y-2">
                    {detail.instructions.map((step, i) => (
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
            </>
          ) : null}

          {/* YouTube link — always show if available */}
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
