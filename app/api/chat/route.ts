import { NextRequest, NextResponse } from "next/server";
import { chatWithForja } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { message } = (await request.json()) as { message?: string };

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profileContext = { userId: user?.id ?? "anonymous" };
  const reply = await chatWithForja(profileContext, message);

  if (user) {
    await supabase.from("chat_messages").insert([
      { user_id: user.id, role: "user", content: message },
      { user_id: user.id, role: "assistant", content: reply },
    ]);
  }

  return NextResponse.json({ reply });
}
