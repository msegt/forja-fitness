import { GoogleGenerativeAI } from "@google/generative-ai";
import type { WorkoutPlan } from "@/types";

const MODEL = "gemini-2.5-flash-lite";

const PLAN_SYSTEM_PROMPT = [
  "You are Forja, a friendly, encouraging British personal trainer AI.",
  "Generate a structured 4-week progressive workout plan.",
  "Each week contains exactly the requested number of sessions.",
  "Each session includes:",
  "- A descriptive focus area (e.g. 'Lower Body Strength & Core')",
  "- 4-6 exercises, each with:",
  "  - sets (number)",
  "  - reps (string, e.g. '10-12')",
  "  - duration (string, only if timed, e.g. '45s')",
  "  - rest (string, e.g. '60s')",
  "  - youtube_query (short English search string for an instructional video)",
  "  - coaching_tip (one encouraging sentence, postnatal-safe cue if postnatal)",
  "  - instructions (array of 3-5 clear step-by-step strings describing how to perform the exercise)",
  "  - muscles (array of muscle group names targeted, e.g. ['glutes', 'hamstrings', 'core'])",
  "POSTNATAL RULES: If postnatal=true or health_notes mentions postnatal/c-section/diastasis/SPD/pelvic floor:",
  "  - Avoid all high-impact moves (jumping, running, burpees) for weeks 1-2",
  "  - Include pelvic floor activation cues in coaching_tip",
  "  - Prioritise core rehab (diaphragmatic breathing, heel slides, dead bugs)",
  "  - No heavy intra-abdominal pressure exercises in early weeks",
  "  - Progress gradually to low-impact cardio from week 3",
  "IMPORTANT: Respond with raw JSON only — no markdown fences, no prose.",
  "Schema: { weeks: [ { week: number, sessions: [ { day: string, focus: string, exercises: [ { name: string, sets: number, reps: string, duration: string, rest: string, youtube_query: string, coaching_tip: string, instructions: string[], muscles: string[] } ] } ] } ] }",
].join("\n");

function getClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

function extractJson(raw: string): string {
  const firstBrace = raw.indexOf("{");
  const firstBracket = raw.indexOf("[");
  const lastBrace = raw.lastIndexOf("}");
  const lastBracket = raw.lastIndexOf("]");
  const start =
    firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket) ? firstBrace : firstBracket;
  const end =
    lastBrace !== -1 && (lastBracket === -1 || lastBrace > lastBracket) ? lastBrace : lastBracket;
  if (start !== -1 && end !== -1 && end > start) return raw.slice(start, end + 1);
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
                instructions: [
                  "Stand with feet shoulder-width apart, toes slightly turned out.",
                  "Brace your core and keep your chest tall.",
                  "Bend your knees and push your hips back as if sitting into a chair.",
                  "Lower until thighs are parallel to the floor, then drive back up.",
                ],
                muscles: ["quads", "glutes", "core"],
              },
              {
                name: "Incline press-up",
                sets: 3,
                reps: "8-10",
                rest: "60s",
                youtube_query: "incline push up form",
                coaching_tip: "Lower under control and keep your core braced.",
                instructions: [
                  "Place hands on a raised surface (bench, sofa edge) wider than shoulder-width.",
                  "Walk feet back until your body forms a straight line.",
                  "Bend elbows to lower your chest to the surface.",
                  "Press back up to the start position.",
                ],
                muscles: ["chest", "shoulders", "triceps"],
              },
              {
                name: "Glute bridge",
                sets: 3,
                reps: "12-15",
                rest: "45s",
                youtube_query: "glute bridge exercise form",
                coaching_tip: "Squeeze your glutes at the top for one second.",
                instructions: [
                  "Lie on your back with knees bent, feet flat on the floor hip-width apart.",
                  "Engage your core gently.",
                  "Press through your heels to lift your hips until your body forms a straight line from shoulders to knees.",
                  "Hold one second, then lower with control.",
                ],
                muscles: ["glutes", "hamstrings", "core"],
              },
              {
                name: "Dead bug",
                duration: "45s",
                rest: "45s",
                youtube_query: "dead bug exercise core",
                coaching_tip: "Keep your lower back pressed gently into the floor throughout.",
                instructions: [
                  "Lie on your back, arms extended toward the ceiling, knees bent at 90°.",
                  "Breathe out and slowly lower your right arm and left leg toward the floor.",
                  "Keep your lower back pressed down — do not let it arch.",
                  "Return to start and repeat on the other side.",
                ],
                muscles: ["core", "abs", "pelvic floor"],
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
    return JSON.parse(cleaned) as WorkoutPlan;
  } catch {
    throw new Error(
      `Gemini returned an invalid plan format. Raw response starts with: ${raw.slice(0, 200)}`,
    );
  }
}

export async function chatWithForja(context: unknown, message: string) {
  const client = getClient();

  if (!client) {
    return "I'm here for you. Keep your effort steady today and focus on tidy movement quality.";
  }

  const model = client.getGenerativeModel({ model: MODEL });
  const prompt = `You are Forja, a warm and encouraging British personal trainer AI. You specialise in helping busy mums, including postnatal women, get back to feeling strong and energised. You have access to this user's profile and current workout plan: ${JSON.stringify(context)}. Answer questions, adjust workouts, provide motivation, swap exercises if needed. If the user is postnatal, always keep pelvic floor safety in mind. Always respond in British English, keep responses concise and practical.\n\nUser: ${message}`;
  const response = await model.generateContent(prompt);
  return response.response.text();
}
