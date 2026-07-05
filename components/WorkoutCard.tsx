import type { Session } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type WorkoutCardProps = {
  session: Session;
  completeAction?: (formData: FormData) => Promise<void>;
};

const MIN_WORKOUT_DURATION_MINUTES = 15;
const ESTIMATED_MINUTES_PER_EXERCISE = 6;
const WORKOUT_DURATION_BUFFER_MINUTES = 15;

export function WorkoutCard({ session, completeAction }: WorkoutCardProps) {
  const configuredSessionLength =
    typeof session.session_length_minutes === "number" && Number.isFinite(session.session_length_minutes)
      ? session.session_length_minutes
      : null;
  const hasConfiguredSessionLength = configuredSessionLength !== null;
  const estimatedMinMinutes = hasConfiguredSessionLength
    ? configuredSessionLength
    : Math.max(MIN_WORKOUT_DURATION_MINUTES, session.exercises.length * ESTIMATED_MINUTES_PER_EXERCISE);
  const estimatedMaxMinutes = hasConfiguredSessionLength
    ? undefined
    : estimatedMinMinutes + WORKOUT_DURATION_BUFFER_MINUTES;

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">{session.day_label}</p>
          <h3 className="text-lg font-semibold text-slate-100">{session.focus}</h3>
        </div>
        <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">{session.exercises.length} exercises</span>
      </div>
      <p className="text-sm text-slate-300">
        Estimated length: {estimatedMaxMinutes ? `${estimatedMinMinutes}–${estimatedMaxMinutes}` : estimatedMinMinutes} minutes
      </p>
      {session.completed ? (
        <Button variant="secondary" disabled>
          Completed
        </Button>
      ) : !completeAction ? (
        <Button disabled>
          Mark as complete
        </Button>
      ) : (
        <form action={completeAction}>
          <input type="hidden" name="sessionId" value={session.id} />
          <Button type="submit">
            Mark as complete
          </Button>
        </form>
      )}
    </Card>
  );
}
