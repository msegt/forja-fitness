import { NextRequest, NextResponse } from "next/server";
import { askAI, loadUserKeyConfig } from "@/lib/ai-client";
import { createClient } from "@/lib/supabase/server";

const VALID_MUSCLES = "chest,shoulders,biceps,triceps,lats,traps,back,abs,core,obliques,glutes,quads,hamstrings,calves,hip flexors,lower back,pelvic floor";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { name?: string; names?: string[] };
  const names: string[] = body.names?.length
    ? body.names.filter((n) => typeof n === "string" && n.trim())
    : body.name ? [body.name] : [];

  if (names.length === 0)
    return NextResponse.json({ error: "At least one exercise name is required" }, { status: 400 });

  // Try to load user key (gracefully ignore auth errors)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userKey = user ? await loadUserKeyConfig(user.id, supabase as Parameters<typeof loadUserKeyConfig>[1]) : { provider: null, apiKey: null };

  const prompt = [
    `You are a personal trainer. For each exercise listed, return raw JSON only (no markdown).`,
    `Schema: [{"name":string,"instructions":string[],"muscles":string[]}]`,
    `instructions: 3-4 steps. muscles: 2-4 names from [${VALID_MUSCLES}].`,
    `Exercises: ${names.map((n) => `"${n}"`).join(", ")}`,
  ].join(" ");

  try {
    const raw = await askAI(prompt, userKey);
    const s = raw.indexOf("[");
    const e = raw.lastIndexOf("]");
    const jsonStr = s !== -1 && e > s ? raw.slice(s, e + 1) : raw;
    const parsed = JSON.parse(jsonStr) as Array<{ name: string; instructions?: string[]; muscles?: string[] }>;

    const result: Record<string, { instructions: string[]; muscles: string[] }> = {};
    for (const item of parsed) {
      if (item.name) result[item.name] = { instructions: item.instructions ?? [], muscles: item.muscles ?? [] };
    }

    if (names.length === 1 && result[names[0]]) return NextResponse.json({ ...result[names[0]], batch: result });
    return NextResponse.json({ batch: result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
