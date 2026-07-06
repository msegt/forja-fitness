import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Forja Fitness",
  description: "Forja is your AI-powered personal trainer for progressive weekly plans.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en-GB">
      <head>
        {/* Prevents iOS Safari from auto-zooming on input focus */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="bg-zinc-950 text-slate-50 antialiased">
        {user ? <NavBar /> : null}
        <div className={user ? "pb-20 md:pb-0" : undefined}>{children}</div>
      </body>
    </html>
  );
}
