"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    if (!email || !password) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setErrorMessage(error?.message ?? "Unable to sign in.");
      setIsSubmitting(false);
      return;
    }

    const { count, error: countError } = await supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", data.user.id);

    if (countError) {
      setErrorMessage("Unable to load your account status. Please try again.");
      setIsSubmitting(false);
      return;
    }

    router.push((count ?? 0) > 0 ? "/dashboard" : "/onboarding");
  }

  async function continueWithGoogle() {
    setIsSubmitting(true);
    setErrorMessage("");
    const supabase = createClient();
    const redirectTo = new URL("/auth/callback", window.location.origin).toString();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full space-y-4">
        <h1 className="text-2xl font-semibold">Log in</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <label htmlFor="login-email" className="block text-sm text-slate-300">Email</label>
          <input id="login-email" required aria-required="true" className="w-full rounded-lg bg-slate-800 p-2 text-sm" placeholder="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <label htmlFor="login-password" className="block text-sm text-slate-300">Password</label>
          <input id="login-password" required aria-required="true" className="w-full rounded-lg bg-slate-800 p-2 text-sm" placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          <Button className="w-full" type="submit" disabled={isSubmitting}>Log in with email</Button>
        </form>
        <Button variant="secondary" className="w-full" onClick={continueWithGoogle} disabled={isSubmitting}>Continue with Google</Button>
        {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}
        <p className="text-sm text-slate-300">
          New here? <Link href="/auth/register" className="text-orange-300 underline">Create an account</Link>
        </p>
      </Card>
    </main>
  );
}
