import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full space-y-4">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <input className="w-full rounded-lg bg-slate-800 p-2 text-sm" placeholder="Full name" />
        <input className="w-full rounded-lg bg-slate-800 p-2 text-sm" placeholder="Email" type="email" />
        <input className="w-full rounded-lg bg-slate-800 p-2 text-sm" placeholder="Password" type="password" />
        <Button className="w-full">Register with email</Button>
        <Button variant="secondary" className="w-full">Continue with Google</Button>
        <p className="text-sm text-slate-300">
          Already have an account? <Link href="/auth/login" className="text-orange-300 underline">Log in</Link>
        </p>
      </Card>
    </main>
  );
}
