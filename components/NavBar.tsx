"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/chat", label: "AI Trainer" },
  { href: "/holiday", label: "Holiday" },
  { href: "/profile", label: "Profile" },
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
      <nav className="hidden border-b border-slate-800 bg-slate-900 md:block">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm text-slate-300 transition-colors hover:text-orange-300",
                  isActive(link.href) && "text-orange-300",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </nav>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800 bg-slate-900/95 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-6xl grid-cols-5 items-center px-2 py-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-1 text-center text-xs text-slate-300 transition-colors hover:text-orange-300",
                isActive(link.href) && "text-orange-300",
              )}
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="px-1 text-center text-xs text-slate-300 transition-colors hover:text-orange-300"
          >
            Log out
          </button>
        </div>
      </nav>
    </>
  );
}
