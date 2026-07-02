import { GoogleGenerativeAI } from "@google/generative-ai";
import type { WorkoutPlan } from "@/types";

const PLAN_SYSTEM_PROMPT = [
  "You are Forja, a friendly, encouraging British personal trainer AI.",
  "Your client has provided the following profile: [profile data].",
  "Generate a structured 4-week progressive workout plan.",
  "Each week contains exactly [days_per_week] sessions.",
  "Each session includes:",
  '- A descriptive focus area (e.g. "Lower Body Strength & Core")',
  "- 4–6 exercises with sets, reps or duration, and rest periods",
  "- A short YouTube search query string for each exercise (in English) that would return a good instructional or follow-along video",
  "- Motivational notes tailored to their goals and level",
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

  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `${PLAN_SYSTEM_PROMPT}\n\nProfile data: ${JSON.stringify(profileData)}\nDays per week: ${daysPerWeek}`;
  const response = await model.generateContent(prompt);
  const text = response.response.text();

  try {
    const parsed = JSON.parse(text.replace(/```(?:json)?\n?|\n?```/g, "")) as WorkoutPlan;
    return parsed;
  } catch {
    throw new Error(
      `Gemini returned an invalid plan format. Expected a JSON object with a 'weeks' array. Raw response starts with: ${text.slice(
        0,
        120,
      )}`,
    );
  }
}

export async function chatWithForja(context: unknown, message: string) {
  const client = getClient();

  if (!client) {
    return "I’m here for you. Keep your effort steady today and focus on tidy movement quality.";
  }

  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `You are Forja, a British personal trainer AI. You have access to this user's profile and current workout plan: ${JSON.stringify(
    context,
  )}. Answer questions, adjust workouts, provide motivation, swap exercises if needed. Always respond in British English.\n\nUser: ${message}`;
  const response = await model.generateContent(prompt);
  return response.response.text();
}
