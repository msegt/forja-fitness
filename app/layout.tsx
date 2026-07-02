import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forja Fitness",
  description: "Forja is your AI-powered British personal trainer for progressive weekly plans.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body className="bg-slate-950 text-slate-50 antialiased">{children}</body>
    </html>
  );
}
