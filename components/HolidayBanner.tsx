import { Card } from "@/components/ui/Card";

export function HolidayBanner() {
  return (
    <Card className="border-orange-400/40 bg-orange-500/10">
      <h2 className="text-lg font-semibold text-orange-200">Holiday mode</h2>
      <p className="mt-2 text-sm text-slate-200">
        Heading away? We can craft a lighter, travel-friendly plan so you stay consistent without overthinking.
      </p>
    </Card>
  );
}
