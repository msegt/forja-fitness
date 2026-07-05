import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-8 px-6 py-16">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.24em] text-orange-300">Forja Fitness</p>
        <h1 className="text-4xl font-bold text-slate-100 sm:text-5xl">Build strength with a friendly AI personal trainer</h1>
        <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
          Forja creates progressive weekly workout plans, supports your sessions with clear video guidance, and keeps you motivated with encouraging coaching.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/auth/register"><Button>Create account</Button></Link>
        <Link href="/auth/login"><Button variant="secondary">Log in</Button></Link>
      </div>
    </main>
  );
}
