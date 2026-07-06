import { Card } from "@/components/ui/Card";

export function ChatBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  return (
    <Card
      className={
        role === "user"
          ? "ml-auto max-w-[85%] border-coral-500/30 bg-coral-500/15"
          : "mr-auto max-w-[85%] border-zinc-700 bg-zinc-800/80"
      }
    >
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        {role === "user" ? "You" : "Forja"}
      </p>
      <p className="text-sm leading-relaxed text-zinc-100">{content}</p>
    </Card>
  );
}
