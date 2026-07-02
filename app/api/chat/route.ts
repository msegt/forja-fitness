import { NextRequest, NextResponse } from "next/server";
import { chatWithForja } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { message } = (await request.json()) as { message?: string };

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profileContext = { userId: user?.id ?? "anonymous" };
  let reply = "";
  try {
    reply = await chatWithForja(profileContext, message);
  } catch {
    return NextResponse.json({ error: "Unable to generate AI response" }, { status: 502 });
  }

  if (user) {
    const { error } = await supabase.from("chat_messages").insert([
      { user_id: user.id, role: "user", content: message },
      { user_id: user.id, role: "assistant", content: reply },
    ]);

    if (error) {
      return NextResponse.json({ error: "Unable to store chat message" }, { status: 500 });
    }
  }

  return NextResponse.json({ reply });
}
