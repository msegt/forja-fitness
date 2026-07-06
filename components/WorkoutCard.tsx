import type { Session } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type WorkoutCardProps = {
  session: Session;
  completeAction?: (formData: FormData) => Promise<void>;
  returnPath?: string;
};

const MIN_WORKOUT_DURATION_MINUTES = 15;
const ESTIMATED_MINUTES_PER_EXERCISE = 6;
const WORKOUT_DURATION_BUFFER_MINUTES = 15;

export function WorkoutCard({ session, completeAction, returnPath = "/dashboard" }: WorkoutCardProps) {
  const sessionLengthMinutes = session.session_length_minutes;
  const configuredSessionLength =
    typeof sessionLengthMinutes === "number" && Number.isFinite(sessionLengthMinutes)
      ? sessionLengthMinutes
      : null;
  const estimatedMinMinutes =
    configuredSessionLength !== null
      ? configuredSessionLength
      : Math.max(MIN_WORKOUT_DURATION_MINUTES, session.exercises.length * ESTIMATED_MINUTES_PER_EXERCISE);
  const estimatedMaxMinutes =
    configuredSessionLength !== null ? undefined : estimatedMinMinutes + WORKOUT_DURATION_BUFFER_MINUTES;

  return (
    <Card className={`space-y-3 ${session.completed ? "opacity-70" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{session.day_label}</p>
          <h3 className="text-lg font-bold text-white">{session.focus}</h3>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
            {session.exercises.length} exercises
          </span>
          {session.completed ? (
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
              ✓ Done
            </span>
          ) : null}
        </div>
      </div>
      <p className="flex items-center gap-1.5 text-sm text-zinc-400">
        <span>⏱</span>
        {estimatedMaxMinutes ? `${estimatedMinMinutes}–${estimatedMaxMinutes}` : estimatedMinMinutes} min
      </p>
      {session.completed ? (
        <Button variant="secondary" disabled className="w-full">
          Completed
        </Button>
      ) : completeAction ? (
        <form action={completeAction}>
          <input type="hidden" name="sessionId" value={session.id} />
          <input type="hidden" name="returnPath" value={returnPath} />
          <Button type="submit" className="w-full">
            Mark as complete
          </Button>
        </form>
      ) : null}
    </Card>
  );
}
