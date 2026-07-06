import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = "gemini-2.5-flash-lite";
const RETRY_DELAYS_MS = [2000, 4000, 6000];

function isRetryable(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes("503") || msg.includes("high demand") || msg.includes("429");
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

async function ask(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("No API key");
  const client = new GoogleGenerativeAI(key);
  const model = client.getGenerativeModel({ model: MODEL });
  const res = await model.generateContent(prompt);
  return res.response.text();
}

async function askWithRetry(prompt: string): Promise<string> {
  let lastError: unknown;
  for (let i = 0; i <= RETRY_DELAYS_MS.length; i++) {
    try {
      return await ask(prompt);
    } catch (err) {
      lastError = err;
      if (!isRetryable(err) || i === RETRY_DELAYS_MS.length) throw err;
      await sleep(RETRY_DELAYS_MS[i]);
    }
  }
  throw lastError;
}

export async function POST(request: NextRequest) {
  const { name } = (await request.json()) as { name?: string };

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Exercise name is required" }, { status: 400 });
  }

  const prompt = [
    `You are a personal trainer. For the exercise "${name}", respond with raw JSON only — no markdown fences.",`,
    `Schema: { "instructions": string[], "muscles": string[] }`,
    `instructions: 4-5 clear step-by-step strings on how to perform the exercise correctly.`,
    `muscles: array of muscle group names targeted (e.g. ["glutes", "hamstrings", "core"]).`,
    `Use common muscle names only: chest, shoulders, biceps, triceps, back, lats, traps, abs, core, obliques, glutes, quads, hamstrings, calves, hip flexors, lower back, pelvic floor.`,
  ].join(" ");

  try {
    const raw = await askWithRetry(prompt);
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");
    const json = firstBrace !== -1 ? raw.slice(firstBrace, lastBrace + 1) : raw;
    const parsed = JSON.parse(json) as { instructions?: string[]; muscles?: string[] };

    return NextResponse.json({
      instructions: Array.isArray(parsed.instructions) ? parsed.instructions : [],
      muscles: Array.isArray(parsed.muscles) ? parsed.muscles : [],
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
