import { NextRequest, NextResponse } from "next/server";
import { chatWithForja } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  const { prompt } = (await request.json()) as { prompt?: string };

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    const message = `Create a temporary holiday training plan. Keep it bodyweight-focused by default, supportive, and practical in British English. User details: ${prompt}`;
    const planSummary = await chatWithForja({ mode: "holiday" }, message);
    return NextResponse.json({ planSummary });
  } catch {
    return NextResponse.json({ error: "Unable to generate holiday plan" }, { status: 502 });
  }
}
