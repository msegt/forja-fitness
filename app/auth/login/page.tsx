"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (email && password) {
      router.push("/dashboard");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full space-y-4">
        <h1 className="text-2xl font-semibold">Log in</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <label htmlFor="login-email" className="block text-sm text-slate-300">Email</label>
          <input id="login-email" className="w-full rounded-lg bg-slate-800 p-2 text-sm" placeholder="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <label htmlFor="login-password" className="block text-sm text-slate-300">Password</label>
          <input id="login-password" className="w-full rounded-lg bg-slate-800 p-2 text-sm" placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          <Button className="w-full" type="submit">Log in with email</Button>
        </form>
        <Button variant="secondary" className="w-full" onClick={() => router.push("/dashboard")}>Continue with Google</Button>
        <p className="text-sm text-slate-300">
          New here? <Link href="/auth/register" className="text-orange-300 underline">Create an account</Link>
        </p>
      </Card>
    </main>
  );
}
