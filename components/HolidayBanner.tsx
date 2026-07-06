import { Card } from "@/components/ui/Card";

export function HolidayBanner() {
  return (
    <Card className="border-amber-400/30 bg-amber-500/10">
      <h2 className="text-lg font-semibold text-amber-300">☀️ Holiday mode</h2>
      <p className="mt-2 text-sm text-zinc-300">
        Heading away? Describe where you&apos;re going and how much time you have, and Forja will craft a lighter, travel-friendly plan so you stay consistent without overthinking it.
      </p>
    </Card>
  );
}
