import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-8 px-6 py-16">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-coral-400">\uD83D\uDD25 Forja Fitness</p>
        <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl">
          Feel strong again.<br />
          <span className="text-coral-400">On your schedule.</span>
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg">
          Forja builds progressive workout plans that fit around your life \u2014 even when that life includes a toddler, a full-time job, and five minutes of quiet.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/auth/register"><Button>Get started \u2192</Button></Link>
        <Link href="/auth/login"><Button variant="secondary">Log in</Button></Link>
      </div>
    </main>
  );
}
