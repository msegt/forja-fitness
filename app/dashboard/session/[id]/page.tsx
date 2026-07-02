import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ExerciseItem } from "@/components/ExerciseItem";

const sampleExercises = [
  {
    name: "Bodyweight squat",
    sets: 3,
    reps: "10-12",
    rest: "60s",
    coaching_tip: "Brace your core and keep your knees tracking over your toes.",
    youtube_query: "bodyweight squat tutorial",
    youtube_url: "https://www.youtube.com/results?search_query=bodyweight+squat+tutorial",
  },
  {
    name: "Incline press-up",
    sets: 3,
    reps: "8-10",
    rest: "60s",
    coaching_tip: "Lower with control and keep a straight line from head to heel.",
    youtube_query: "incline push up form",
    youtube_url: "https://www.youtube.com/results?search_query=incline+push+up+form",
  },
  {
    name: "Split squat",
    sets: 3,
    reps: "8 each side",
    rest: "75s",
    coaching_tip: "Stay tall and lower slowly.",
    youtube_query: "split squat technique",
    youtube_url: "https://www.youtube.com/results?search_query=split+squat+technique",
  },
  {
    name: "Plank",
    duration: "45s",
    rest: "45s",
    coaching_tip: "Tuck your pelvis slightly and breathe steadily.",
    youtube_query: "plank tutorial",
    youtube_url: "https://www.youtube.com/results?search_query=plank+tutorial",
  },
];

export default function SessionDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl space-y-5 px-4 py-8">
      <Link href="/dashboard" className="text-sm text-orange-300 underline">Back to dashboard</Link>
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-400">Session {params.id}</p>
        <h1 className="text-3xl font-bold text-slate-100">Lower body strength and core</h1>
      </header>
      <section className="space-y-3">
        {sampleExercises.map((exercise) => (
          <ExerciseItem key={exercise.name} exercise={exercise} />
        ))}
      </section>
      <Button>Mark session complete</Button>
    </main>
  );
}
