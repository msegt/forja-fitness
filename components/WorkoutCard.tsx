import type { Session } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type WorkoutCardProps = {
  session: Session;
  onComplete?: (sessionId: string) => void;
};

const MIN_WORKOUT_DURATION_MINUTES = 15;
const ESTIMATED_MINUTES_PER_EXERCISE = 6;
const WORKOUT_DURATION_BUFFER_MINUTES = 15;

export function WorkoutCard({ session, onComplete }: WorkoutCardProps) {
  const estimatedMin = Math.max(MIN_WORKOUT_DURATION_MINUTES, session.exercises.length * ESTIMATED_MINUTES_PER_EXERCISE);
  const estimatedMax = estimatedMin + WORKOUT_DURATION_BUFFER_MINUTES;

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">{session.day_label}</p>
          <h3 className="text-lg font-semibold text-slate-100">{session.focus}</h3>
        </div>
        <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">{session.exercises.length} exercises</span>
      </div>
      <p className="text-sm text-slate-300">Estimated length: {estimatedMin}–{estimatedMax} minutes</p>
      <Button
        variant={session.completed ? "secondary" : "primary"}
        onClick={() => onComplete?.(session.id)}
        disabled={session.completed}
      >
        {session.completed ? "Completed" : "Mark as complete"}
      </Button>
    </Card>
  );
}
