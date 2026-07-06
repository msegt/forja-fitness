/**
 * Unified AI caller.
 * Picks the user's own key + provider if set, otherwise falls back to the
 * app-level GEMINI_API_KEY environment variable.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export type AiProvider = "gemini" | "openai" | "anthropic";

export interface UserKeyConfig {
  provider: AiProvider | null;
  apiKey: string | null;
}

const RETRY_DELAYS_MS = [2000, 4000, 6000, 8000];

function isRetryable(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("503") ||
    msg.includes("high demand") ||
    msg.includes("429") ||
    msg.includes("overloaded") ||
    msg.includes("rate limit")
  );
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  const res = await model.generateContent(prompt);
  return res.response.text();
}

async function callOpenAI(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096,
    }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `OpenAI error ${res.status}`);
  }
  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  return data.choices[0]?.message?.content ?? "";
}

async function callAnthropic(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `Anthropic error ${res.status}`);
  }
  const data = (await res.json()) as { content: { text: string }[] };
  return data.content[0]?.text ?? "";
}

async function callOnce(provider: AiProvider, apiKey: string, prompt: string): Promise<string> {
  if (provider === "openai") return callOpenAI(apiKey, prompt);
  if (provider === "anthropic") return callAnthropic(apiKey, prompt);
  return callGemini(apiKey, prompt);
}

export async function askAI(
  prompt: string,
  userKey: UserKeyConfig,
): Promise<string> {
  const provider: AiProvider =
    userKey.provider && userKey.apiKey ? userKey.provider : "gemini";
  const apiKey: string =
    userKey.provider && userKey.apiKey
      ? userKey.apiKey
      : (process.env.GEMINI_API_KEY ?? "");

  if (!apiKey) throw new Error("No API key configured.");

  let lastError: unknown;
  for (let i = 0; i <= RETRY_DELAYS_MS.length; i++) {
    try {
      return await callOnce(provider, apiKey, prompt);
    } catch (err) {
      lastError = err;
      if (!isRetryable(err) || i === RETRY_DELAYS_MS.length) throw err;
      await sleep(RETRY_DELAYS_MS[i]);
    }
  }
  throw lastError;
}

// Accept `unknown` so callers don't need to cast the Supabase client type
export async function loadUserKeyConfig(
  userId: string,
  supabase: unknown,
): Promise<UserKeyConfig> {
  type SupabaseLike = {
    from: (table: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          maybeSingle: () => Promise<{
            data: { ai_provider?: string | null; ai_api_key?: string | null } | null;
          }>;
        };
      };
    };
  };

  const db = supabase as SupabaseLike;
  const { data } = await db
    .from("profiles")
    .select("ai_provider, ai_api_key")
    .eq("id", userId)
    .maybeSingle();

  return {
    provider: (data?.ai_provider as AiProvider | null) ?? null,
    apiKey: data?.ai_api_key ?? null,
  };
}
