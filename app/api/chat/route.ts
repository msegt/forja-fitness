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

  // Build rich context so Forja can give personalised answers
  let profileContext: Record<string, unknown> = { userId: user?.id ?? "anonymous" };

  if (user) {
    const [{ data: profile }, { data: plan }, { data: sessions }] = await Promise.all([
      supabase.from("profiles").select("full_name, fitness_level, goals, health_notes").eq("id", user.id).maybeSingle(),
      supabase.from("workout_plans").select("days_per_week, session_length_minutes, equipment, gemini_raw_plan").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("sessions").select("day_label, focus, completed").eq("user_id", user.id).order("created_at", { ascending: true }),
    ]);

    profileContext = {
      userId: user.id,
      profile: profile ?? {},
      plan: plan ?? {},
      sessions: sessions ?? [],
    };
  }

  let reply = "";
  try {
    reply = await chatWithForja(profileContext, message);
  } catch {
    return NextResponse.json({ error: "Unable to generate AI response" }, { status: 502 });
  }

  if (user) {
    await supabase.from("chat_messages").insert([
      { user_id: user.id, role: "user", content: message },
      { user_id: user.id, role: "assistant", content: reply },
    ]);
  }

  return NextResponse.json({ reply });
}
