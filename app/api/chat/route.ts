import { NextRequest, NextResponse } from "next/server";
import { chatWithForja } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { message } = (await request.json()) as { message?: string };

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Slim context — never send full plan JSON to Gemini
  let context: { name?: string; fitnessLevel?: string; goals?: string[]; sessionSummary?: string } = {};

  if (user) {
    const [{ data: profile }, { data: plan }, { data: sessions }] = await Promise.all([
      supabase.from("profiles").select("full_name, fitness_level, goals").eq("id", user.id).maybeSingle(),
      supabase.from("workout_plans").select("days_per_week, session_length_minutes, equipment").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("sessions").select("focus, completed").eq("user_id", user.id).order("created_at", { ascending: true }).limit(12),
    ]);

    // Build a short plain-text summary instead of raw JSON
    const completedCount = sessions?.filter((s) => s.completed).length ?? 0;
    const totalCount = sessions?.length ?? 0;
    const focusList = sessions?.slice(0, 4).map((s) => s.focus).join(", ") ?? "";
    const sessionSummary = plan
      ? `${plan.days_per_week}d/wk, ${plan.session_length_minutes}min, equipment: ${(plan.equipment as string[] | null)?.join(",") ?? "none"}. Sessions: ${focusList}. Progress: ${completedCount}/${totalCount} done.`
      : undefined;

    context = {
      name: profile?.full_name?.split(" ")[0],
      fitnessLevel: profile?.fitness_level ?? undefined,
      goals: profile?.goals ?? [],
      sessionSummary,
    };
  }

  let reply = "";
  try {
    reply = await chatWithForja(context, message);
  } catch {
    return NextResponse.json({ error: "Unable to reach the AI right now. Please try again in a moment." }, { status: 502 });
  }

  if (user) {
    await supabase.from("chat_messages").insert([
      { user_id: user.id, role: "user", content: message },
      { user_id: user.id, role: "assistant", content: reply },
    ]);
  }

  return NextResponse.json({ reply });
}
