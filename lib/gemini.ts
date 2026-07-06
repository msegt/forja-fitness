import type { WorkoutPlan } from "@/types";
import { askAI, type UserKeyConfig } from "@/lib/ai-client";

const PLAN_PROMPT = `You are Forja, a British personal trainer AI. Generate a 4-week progressive workout plan as raw JSON only (no markdown).
Schema: {"weeks":[{"week":number,"sessions":[{"day":string,"focus":string,"exercises":[{"name":string,"sets":number,"reps":string,"duration":string,"rest":string,"youtube_query":string,"coaching_tip":string,"instructions":string[],"muscles":string[]}]}]}]}
Rules:
- Each week has exactly daysPerWeek sessions.
- Each session has 4-5 exercises.
- instructions: 3-4 steps. muscles: 2-4 names from [chest,shoulders,biceps,triceps,lats,traps,back,abs,core,obliques,glutes,quads,hamstrings,calves,hip flexors,lower back,pelvic floor].
- If postnatal=true: no jumping/running weeks 1-2, include pelvic floor cues, prioritise core rehab.
- Respond with JSON only.`;

const FALLBACK_KEY: UserKeyConfig = { provider: null, apiKey: null };

function extractJson(raw: string): string {
  const s = raw.indexOf("{");
  const e = raw.lastIndexOf("}");
  if (s !== -1 && e > s) return raw.slice(s, e + 1);
  return raw.replace(/^```[\w]*\s*/i, "").replace(/\s*```\s*$/i, "").trim();
}

function slimProfile(profileData: unknown, daysPerWeek: number) {
  const p = profileData as Record<string, unknown>;
  return {
    daysPerWeek,
    sessionLength: p.sessionLength ?? 30,
    fitnessLevel: p.fitnessLevel ?? "beginner",
    postnatal: p.postnatal ?? false,
    goals: p.goals ?? [],
    equipment: p.equipment ?? [],
    healthNotes: p.healthNotes ?? "",
    age: p.dateOfBirth
      ? Math.floor((Date.now() - new Date(p.dateOfBirth as string).getTime()) / 31557600000)
      : null,
  };
}

export async function generateWorkoutPlan(
  profileData: unknown,
  daysPerWeek: number,
  userKey: UserKeyConfig = FALLBACK_KEY,
): Promise<WorkoutPlan> {
  const hasKey = userKey.apiKey || process.env.GEMINI_API_KEY;
  if (!hasKey) {
    return {
      weeks: [{
        week: 1,
        sessions: Array.from({ length: daysPerWeek }, (_, i) => ({
          day: `Day ${i + 1}`,
          focus: "Full Body Foundations",
          exercises: [
            { name: "Bodyweight Squat", sets: 3, reps: "10-12", rest: "60s", youtube_query: "bodyweight squat form", coaching_tip: "Drive through your heels and keep your chest tall.", instructions: ["Stand feet shoulder-width apart.", "Brace core, keep chest up.", "Lower until thighs are parallel.", "Drive back up through heels."], muscles: ["quads", "glutes", "core"] },
            { name: "Glute Bridge", sets: 3, reps: "12-15", rest: "45s", youtube_query: "glute bridge form", coaching_tip: "Squeeze at the top for a full second.", instructions: ["Lie on back, knees bent, feet flat.", "Engage core.", "Press hips up to form a straight line.", "Lower with control."], muscles: ["glutes", "hamstrings"] },
            { name: "Incline Press-Up", sets: 3, reps: "8-10", rest: "60s", youtube_query: "incline push up", coaching_tip: "Keep your body in a straight line throughout.", instructions: ["Hands on raised surface wider than shoulders.", "Body forms a plank.", "Lower chest to surface.", "Press back up."], muscles: ["chest", "shoulders", "triceps"] },
            { name: "Dead Bug", sets: 3, reps: "8 each side", rest: "45s", youtube_query: "dead bug core exercise", coaching_tip: "Keep your lower back pressed gently into the floor.", instructions: ["Lie on back, arms up, knees at 90\u00b0.", "Breathe out and lower opposite arm and leg.", "Keep lower back flat.", "Return and repeat other side."], muscles: ["core", "abs"] },
          ],
        })),
      }],
    };
  }

  const slim = slimProfile(profileData, daysPerWeek);
  const raw = await askAI(`${PLAN_PROMPT}\n\nUser: ${JSON.stringify(slim)}`, userKey);

  try {
    return JSON.parse(extractJson(raw)) as WorkoutPlan;
  } catch {
    throw new Error(`Invalid plan format. Response starts: ${raw.slice(0, 200)}`);
  }
}

export interface ForjaContext {
  name?: string;
  fitnessLevel?: string;
  goals?: string[];
  sessionSummary?: string;
  mode?: string;
}

export async function chatWithForja(
  context: ForjaContext,
  message: string,
  userKey: UserKeyConfig = FALLBACK_KEY,
) {
  const hasKey = userKey.apiKey || process.env.GEMINI_API_KEY;
  if (!hasKey) return "I\u2019m here for you. Stay consistent and focus on quality movement today.";

  const system = `You are Forja, a warm British personal trainer AI for busy mums. Be concise and practical. User: name=${context.name ?? "there"}, level=${context.fitnessLevel ?? "beginner"}, goals=${(context.goals ?? []).join(",") || "general fitness"}${context.sessionSummary ? `, plan summary=${context.sessionSummary}` : ""}${context.mode ? `, mode=${context.mode}` : ""}.`;
  return askAI(`${system}\n\nUser: ${message}`, userKey);
}
