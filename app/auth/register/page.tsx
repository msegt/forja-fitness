"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (fullName && email && password) {
      router.push("/onboarding");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full space-y-4">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <label htmlFor="register-full-name" className="block text-sm text-slate-300">Full name</label>
          <input id="register-full-name" className="w-full rounded-lg bg-slate-800 p-2 text-sm" placeholder="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
          <label htmlFor="register-email" className="block text-sm text-slate-300">Email</label>
          <input id="register-email" className="w-full rounded-lg bg-slate-800 p-2 text-sm" placeholder="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <label htmlFor="register-password" className="block text-sm text-slate-300">Password</label>
          <input id="register-password" className="w-full rounded-lg bg-slate-800 p-2 text-sm" placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          <Button className="w-full" type="submit">Register with email</Button>
        </form>
        <Button variant="secondary" className="w-full" onClick={() => router.push("/onboarding")}>Continue with Google</Button>
        <p className="text-sm text-slate-300">
          Already have an account? <Link href="/auth/login" className="text-orange-300 underline">Log in</Link>
        </p>
      </Card>
    </main>
  );
}
