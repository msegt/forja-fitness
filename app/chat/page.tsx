"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ChatBubble } from "@/components/ChatBubble";

type Message = { id: string; role: "user" | "assistant"; content: string };

const quickActions = [
  "What should I do if I only have 15 minutes today?",
  "I'm feeling exhausted — should I still train?",
  "Can you suggest a swap for this exercise?",
  "How do I know if I'm ready for more intensity?",
];

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      role: "assistant",
      content: "Hi, I'm Forja 👋 I know life with a little one is unpredictable. Tell me how you're feeling today and I'll help you make the most of the time you have.",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const nextMessages: Message[] = [...messages, { id: `user-${Date.now()}`, role: "user", content: trimmed }];
    setMessages(nextMessages);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };
      const reply = data.reply ?? data.error ?? "Sorry, something went wrong. Please try again.";
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: "assistant", content: reply }]);
    } catch {
      setMessages((current) => [...current, { id: `error-${Date.now()}`, role: "assistant", content: "I couldn't reach the server just now. Please check your connection and try again." }]);
    } finally {
      setIsLoading(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void sendMessage(message);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-4 px-4 py-6">
      <h1 className="text-3xl font-bold text-slate-100">Chat with Forja</h1>
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <Button key={action} variant="secondary" onClick={() => void sendMessage(action)} disabled={isLoading}>
            {action}
          </Button>
        ))}
      </div>
      <section className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/40 p-4">
        {messages.map((item) => (
          <ChatBubble key={item.id} role={item.role} content={item.content} />
        ))}
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="animate-pulse">Forja is thinking…</span>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </section>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          id="chat-message"
          aria-label="Chat message"
          className="flex-1 rounded-lg bg-slate-800 p-2 text-sm"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask Forja for guidance…"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !message.trim()}>Send</Button>
      </form>
    </main>
  );
}
