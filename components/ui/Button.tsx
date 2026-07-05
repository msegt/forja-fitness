import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-orange-500 text-slate-950 hover:bg-orange-400",
        variant === "secondary" && "bg-slate-800 text-slate-100 hover:bg-slate-700",
        variant === "ghost" && "bg-transparent text-slate-200 hover:bg-slate-800",
        className,
      )}
      {...props}
    />
  );
}
