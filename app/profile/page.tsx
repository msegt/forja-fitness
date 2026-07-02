import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl space-y-4 px-4 py-8">
      <h1 className="text-3xl font-bold">Profile settings</h1>
      <Card className="space-y-3">
        <input className="w-full rounded-lg bg-slate-800 p-2 text-sm" placeholder="Full name" />
        <input className="w-full rounded-lg bg-slate-800 p-2 text-sm" type="date" />
        <input className="w-full rounded-lg bg-slate-800 p-2 text-sm" type="number" placeholder="Weight (kg)" />
        <input className="w-full rounded-lg bg-slate-800 p-2 text-sm" type="number" placeholder="Height (cm)" />
        <Button>Save profile</Button>
      </Card>
    </main>
  );
}
