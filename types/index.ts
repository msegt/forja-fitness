export type FitnessLevel = "beginner" | "intermediate" | "advanced";

export type Profile = {
  id: string;
  full_name: string | null;
  date_of_birth: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  fitness_level: FitnessLevel | null;
  goals: string[];
  health_notes: string | null;
};

export type Exercise = {
  name: string;
  sets?: number;
  reps?: string;
  duration?: string;
  rest?: string;
  youtube_query: string;
  youtube_url?: string;
  youtube_thumbnail?: string;
  coaching_tip?: string;
  /** Step-by-step instructions for how to perform the exercise */
  instructions?: string[];
  /** Muscles targeted, e.g. ["glutes", "hamstrings", "core"] */
  muscles?: string[];
};

export type Session = {
  id: string;
  day_label: string;
  focus: string;
  exercises: Exercise[];
  completed: boolean;
  session_length_minutes?: number | null;
};

export type WorkoutWeek = {
  week: number;
  sessions: Array<{
    day: string;
    focus: string;
    exercises: Exercise[];
  }>;
};

export type WorkoutPlan = {
  weeks: WorkoutWeek[];
};
