import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-[44px] items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-400 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-gradient-to-r from-coral-500 to-amber-400 text-white shadow-md shadow-coral-900/40 hover:from-coral-400 hover:to-amber-300 active:scale-95",
        variant === "secondary" &&
          "border border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 active:scale-95",
        variant === "ghost" &&
          "bg-transparent text-zinc-300 hover:bg-zinc-800 active:scale-95",
        className,
      )}
      {...props}
    />
  );
}
