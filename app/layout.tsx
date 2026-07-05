import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Forja Fitness",
  description: "Forja is your AI-powered British personal trainer for progressive weekly plans.",
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
      <body className="bg-slate-950 text-slate-50 antialiased">
        {user ? <NavBar /> : null}
        <div className={user ? "pb-20 md:pb-0" : undefined}>{children}</div>
      </body>
    </html>
  );
}
