import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = "gemini-2.5-flash-lite";
const RETRY_DELAYS_MS = [2000, 4000, 6000];
const VALID_MUSCLES = "chest,shoulders,biceps,triceps,lats,traps,back,abs,core,obliques,glutes,quads,hamstrings,calves,hip flexors,lower back,pelvic floor";

function isRetryable(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes("503") || msg.includes("high demand") || msg.includes("429");
}
function sleep(ms: number) { return new Promise<void>((r) => setTimeout(r, ms)); }

async function askWithRetry(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("No API key");
  const client = new GoogleGenerativeAI(key);
  const model = client.getGenerativeModel({ model: MODEL });
  let lastError: unknown;
  for (let i = 0; i <= RETRY_DELAYS_MS.length; i++) {
    try {
      const res = await model.generateContent(prompt);
      return res.response.text();
    } catch (err) {
      lastError = err;
      if (!isRetryable(err) || i === RETRY_DELAYS_MS.length) throw err;
      await sleep(RETRY_DELAYS_MS[i]);
    }
  }
  throw lastError;
}

// Accept a batch of exercise names and return details for all in one API call
export async function POST(request: NextRequest) {
  const body = (await request.json()) as { name?: string; names?: string[] };

  // Support both single name and batch names[]
  const names: string[] = body.names?.length
    ? body.names.filter((n) => typeof n === "string" && n.trim())
    : body.name ? [body.name] : [];

  if (names.length === 0) {
    return NextResponse.json({ error: "At least one exercise name is required" }, { status: 400 });
  }

  // One prompt for all exercises — drastically reduces API calls
  const prompt = [
    `You are a personal trainer. For each exercise listed, return raw JSON only (no markdown).`,
    `Schema: [{"name":string,"instructions":string[],"muscles":string[]}]`,
    `instructions: 3-4 steps. muscles: 2-4 names from [${VALID_MUSCLES}].`,
    `Exercises: ${names.map((n) => `"${n}"`).join(", ")}`,
  ].join(" ");

  try {
    const raw = await askWithRetry(prompt);
    // Extract JSON array
    const s = raw.indexOf("[");
    const e = raw.lastIndexOf("]");
    const jsonStr = s !== -1 && e > s ? raw.slice(s, e + 1) : raw;
    const parsed = JSON.parse(jsonStr) as Array<{ name: string; instructions?: string[]; muscles?: string[] }>;

    // Return as a map keyed by name for easy lookup
    const result: Record<string, { instructions: string[]; muscles: string[] }> = {};
    for (const item of parsed) {
      if (item.name) {
        result[item.name] = {
          instructions: Array.isArray(item.instructions) ? item.instructions : [],
          muscles: Array.isArray(item.muscles) ? item.muscles : [],
        };
      }
    }

    // Also keep single-name compat response
    if (names.length === 1 && result[names[0]]) {
      return NextResponse.json({ ...result[names[0]], batch: result });
    }

    return NextResponse.json({ batch: result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
