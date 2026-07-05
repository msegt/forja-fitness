import { Card } from "@/components/ui/Card";

export function ChatBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  return (
    <Card className={role === "user" ? "ml-auto max-w-xl bg-orange-500/20" : "mr-auto max-w-xl"}>
      <p className="text-xs uppercase tracking-wide text-slate-400">{role === "user" ? "You" : "Forja"}</p>
      <p className="text-sm text-slate-100">{content}</p>
    </Card>
  );
}
