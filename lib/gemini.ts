import { GoogleGenerativeAI } from "@google/generative-ai";
import type { WorkoutPlan } from "@/types";

const MODEL = "gemini-1.5-flash-8b";

const PLAN_SYSTEM_PROMPT = [
  "You are Forja, a friendly, encouraging British personal trainer AI.",
  "Generate a structured 4-week progressive workout plan.",
  "Each week contains exactly the requested number of sessions.",
  "Each session includes:",
  '- A descriptive focus area (e.g. "Lower Body Strength & Core")',
  "- 4\u20136 exercises with sets, reps or duration, and rest periods",
  "- A short YouTube search query string for each exercise (in English) that would return a good instructional or follow-along video",
  "- Motivational notes tailored to their goals and level",
  "IMPORTANT: Respond with raw JSON only. Do not wrap the response in markdown code fences or any other formatting.",
  "Format the output as valid JSON matching this schema:",
  "{ weeks: [ { week: number, sessions: [ { day: string, focus: string, exercises: [ { name: string, sets: number, reps: string, duration: string, rest: string, youtube_query: string, coaching_tip: string } ] } ] } ] }",
].join("\n");

function getClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return null;
  }
  return new GoogleGenerativeAI(key);
}

/**
 * Extracts the JSON object/array from a raw string, handling code fences
 * and any surrounding prose the model may have added.
 */
function extractJson(raw: string): string {
  const firstBrace = raw.indexOf("{");
  const firstBracket = raw.indexOf("[");
  const lastBrace = raw.lastIndexOf("}");
  const lastBracket = raw.lastIndexOf("]");

  const start =
    firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)
      ? firstBrace
      : firstBracket;
  const end =
    lastBrace !== -1 && (lastBracket === -1 || lastBrace > lastBracket)
      ? lastBrace
      : lastBracket;

  if (start !== -1 && end !== -1 && end > start) {
    return raw.slice(start, end + 1);
  }

  return raw.replace(/^```[\w]*\s*/i, "").replace(/\s*```\s*$/i, "").trim();
}

export async function generateWorkoutPlan(profileData: unknown, daysPerWeek: number): Promise<WorkoutPlan> {
  const client = getClient();

  if (!client) {
    return {
      weeks: [
        {
          week: 1,
          sessions: Array.from({ length: daysPerWeek }, (_, index) => ({
            day: `Day ${index + 1}`,
            focus: "Full Body Foundations",
            exercises: [
              {
                name: "Bodyweight squat",
                sets: 3,
                reps: "10-12",
                rest: "60s",
                youtube_query: "bodyweight squat technique",
                coaching_tip: "Keep your chest proud and drive through your heels.",
              },
              {
                name: "Incline press-up",
                sets: 3,
                reps: "8-10",
                rest: "60s",
                youtube_query: "incline push up form",
                coaching_tip: "Lower under control and keep your core braced.",
              },
              {
                name: "Glute bridge",
                sets: 3,
                reps: "12-15",
                rest: "45s",
                youtube_query: "glute bridge exercise form",
                coaching_tip: "Squeeze your glutes at the top for one second.",
              },
              {
                name: "Marching plank",
                duration: "45s",
                rest: "45s",
                youtube_query: "plank shoulder taps tutorial",
                coaching_tip: "Keep your hips still as you tap each shoulder.",
              },
            ],
          })),
        },
      ],
    };
  }

  const model = client.getGenerativeModel({ model: MODEL });
  const prompt = `${PLAN_SYSTEM_PROMPT}\n\nProfile data: ${JSON.stringify(profileData)}\nDays per week: ${daysPerWeek}`;
  const response = await model.generateContent(prompt);
  const raw = response.response.text();

  try {
    const cleaned = extractJson(raw);
    const parsed = JSON.parse(cleaned) as WorkoutPlan;
    return parsed;
  } catch {
    throw new Error(
      `Gemini returned an invalid plan format. Expected a JSON object with a 'weeks' array. Raw response starts with: ${raw.slice(0, 200)}`,
    );
  }
}

export async function chatWithForja(context: unknown, message: string) {
  const client = getClient();

  if (!client) {
    return "I'm here for you. Keep your effort steady today and focus on tidy movement quality.";
  }

  const model = client.getGenerativeModel({ model: MODEL });
  const prompt = `You are Forja, a British personal trainer AI. You have access to this user's profile and current workout plan: ${JSON.stringify(
    context,
  )}. Answer questions, adjust workouts, provide motivation, swap exercises if needed. Always respond in British English.\n\nUser: ${message}`;
  const response = await model.generateContent(prompt);
  return response.response.text();
}
