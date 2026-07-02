"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ChatBubble } from "@/components/ChatBubble";

type Message = { id: string; role: "user" | "assistant"; content: string };

const quickActions = ["Swap this exercise", "I’m feeling tired today", "Make this week harder", "Explain this exercise"];

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      role: "assistant",
      content: "Hi, I’m Forja. Tell me how today’s training feels and I’ll help you adapt your plan.",
    },
  ]);

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }

    const nextMessages: Message[] = [...messages, { id: `user-${Date.now()}`, role: "user", content: trimmed }];
    setMessages(nextMessages);
    setMessage("");

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: trimmed }),
    });

    const data = (await response.json()) as { reply: string };
    setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: "assistant", content: data.reply }]);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void sendMessage(message);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-4 px-4 py-6">
      <h1 className="text-3xl font-bold">AI personal trainer chat</h1>
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <Button key={action} variant="secondary" onClick={() => void sendMessage(action)}>
            {action}
          </Button>
        ))}
      </div>
      <section className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/40 p-4">
        {messages.map((item) => (
          <ChatBubble key={item.id} role={item.role} content={item.content} />
        ))}
      </section>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input id="chat-message" aria-label="Chat message" className="flex-1 rounded-lg bg-slate-800 p-2 text-sm" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask Forja for guidance" />
        <Button type="submit">Send</Button>
      </form>
    </main>
  );
}
