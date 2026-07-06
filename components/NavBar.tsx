"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", emoji: "🏋️" },
  { href: "/chat", label: "AI Trainer", emoji: "🤖" },
  { href: "/holiday", label: "Holiday", emoji: "☀️" },
  { href: "/profile", label: "Profile", emoji: "👤" },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden border-b border-zinc-800 bg-zinc-900/95 backdrop-blur md:block">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-1">
            <span className="mr-4 text-sm font-bold tracking-tight text-white">Forja 🔥</span>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:text-coral-300",
                  isActive(link.href) ? "bg-coral-500/15 text-coral-300" : "text-zinc-400",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:text-coral-300"
          >
            Log out
          </button>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-900/98 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-6xl grid-cols-5 items-end px-1 pb-safe pt-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium transition-colors",
                isActive(link.href) ? "text-coral-300" : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              <span className="text-lg leading-none">{link.emoji}</span>
              <span>{link.label}</span>
            </Link>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <span className="text-lg leading-none">🚪</span>
            <span>Log out</span>
          </button>
        </div>
      </nav>
    </>
  );
}
