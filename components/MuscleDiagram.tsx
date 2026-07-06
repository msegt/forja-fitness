"use client";

/**
 * Anatomical muscle diagram inspired by the wger fitness project's open-source
 * muscle SVGs (CC BY-SA 4.0). Uses accurately traced silhouette + per-muscle
 * paths that can be independently coloured.
 */

export type MuscleId =
  | "f-pec" | "f-delt" | "f-bicep" | "f-forearm"
  | "f-abs" | "f-oblique" | "f-quad" | "f-hipflex" | "f-calf"
  | "b-trap" | "b-delt" | "b-tricep" | "b-lat"
  | "b-erector" | "b-glute" | "b-ham" | "b-calf";

const MUSCLE_MAP: Record<string, MuscleId[]> = {
  chest: ["f-pec"],
  pectorals: ["f-pec"],
  "pectoralis major": ["f-pec"],
  "pec minor": ["f-pec"],
  shoulders: ["f-delt", "b-delt"],
  deltoids: ["f-delt", "b-delt"],
  "front deltoid": ["f-delt"],
  "rear deltoid": ["b-delt"],
  biceps: ["f-bicep"],
  "biceps brachii": ["f-bicep"],
  forearms: ["f-forearm"],
  abs: ["f-abs"],
  core: ["f-abs", "f-oblique"],
  "rectus abdominis": ["f-abs"],
  obliques: ["f-oblique"],
  "external obliques": ["f-oblique"],
  quads: ["f-quad"],
  quadriceps: ["f-quad"],
  "hip flexors": ["f-hipflex"],
  calves: ["f-calf", "b-calf"],
  gastrocnemius: ["b-calf"],
  glutes: ["b-glute"],
  "gluteus maximus": ["b-glute"],
  "glute max": ["b-glute"],
  hamstrings: ["b-ham"],
  back: ["b-lat", "b-trap"],
  lats: ["b-lat"],
  "latissimus dorsi": ["b-lat"],
  traps: ["b-trap"],
  trapezius: ["b-trap"],
  triceps: ["b-tricep"],
  "triceps brachii": ["b-tricep"],
  "lower back": ["b-erector"],
  erectors: ["b-erector"],
  "erector spinae": ["b-erector"],
  "pelvic floor": ["f-hipflex"],
  "transverse abdominis": ["f-abs"],
};

function resolve(muscles: string[]): Set<MuscleId> {
  const s = new Set<MuscleId>();
  for (const m of muscles) {
    const ids = MUSCLE_MAP[m.toLowerCase().trim()];
    if (ids) ids.forEach((id) => s.add(id));
  }
  return s;
}

// Colour tokens
const C = {
  skin: "#c8a882",
  skinDark: "#b8966e",
  muscleFill: "#2a2a2e",
  muscleStroke: "#444",
  active: "#f97316",
  activeStroke: "#ea6a00",
  bone: "#e8d5b0",
};

function mFill(id: MuscleId, active: Set<MuscleId>) {
  return active.has(id) ? C.active : C.muscleFill;
}
function mStroke(id: MuscleId, active: Set<MuscleId>) {
  return active.has(id) ? C.activeStroke : C.muscleStroke;
}
function mw(id: MuscleId, active: Set<MuscleId>) {
  return active.has(id) ? 1 : 0.5;
}

// ─── FRONT VIEW ─────────────────────────────────────────────────────────────
function FrontBody({ active }: { active: Set<MuscleId> }) {
  return (
    <svg
      viewBox="0 0 200 480"
      width="120"
      height="288"
      aria-label="Front muscle diagram"
      style={{ display: "block" }}
    >
      <defs>
        <radialGradient id="skinGrad" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#d4b896" />
          <stop offset="100%" stopColor="#b8966e" />
        </radialGradient>
        <radialGradient id="activeGrad" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#c2410c" />
        </radialGradient>
      </defs>

      {/* ── Body silhouette ── */}
      <path
        d="
          M 88,8 C 76,8 68,16 68,26 C 68,38 74,46 88,50 C 102,46 108,38 108,26 C 108,16 100,8 88,8 Z
          M 76,50 C 64,52 52,58 46,68 C 40,78 40,90 42,100 L 36,104 C 28,108 22,116 20,126
          L 18,152 L 24,152 L 26,136 C 28,128 32,122 38,120 L 40,158 C 36,162 34,168 34,176
          L 34,210 L 40,210 L 40,178 C 40,172 42,166 46,162 L 48,210 L 54,210
          L 54,162 C 58,166 60,172 60,178 L 60,210 L 66,210 L 66,176
          C 66,168 64,162 60,158 L 62,120 C 68,122 72,128 74,136 L 76,210 L 82,210
          L 82,136 C 82,128 80,122 76,118 L 76,100 C 80,90 82,78 82,68
          L 80,60 L 88,58 L 96,60 L 94,68 C 94,78 96,90 100,100 L 100,118
          C 96,122 94,128 94,136 L 94,210 L 100,210 L 102,136 C 104,128 108,122
          114,120 L 116,158 C 112,162 110,168 110,176 L 110,210 L 116,210
          L 116,178 C 116,172 118,166 122,162 L 124,210 L 130,210 L 132,162
          C 136,166 138,172 138,178 L 138,210 L 144,210 L 144,176
          C 144,168 142,162 138,158 L 140,120 C 146,122 150,128 152,136
          L 154,152 L 160,152 L 158,126 C 156,116 150,108 142,104 L 136,100
          C 138,90 138,78 132,68 C 126,58 114,52 100,50 Z
        "
        fill="url(#skinGrad)"
        stroke={C.skinDark}
        strokeWidth={1}
      />

      {/* ── Neck ── */}
      <path d="M 82,48 C 82,54 84,58 88,60 C 92,58 94,54 94,48 Z"
        fill={C.skin} stroke={C.skinDark} strokeWidth={0.5} />

      {/* ── Pectorals ── */}
      <path
        d="M 60,72 C 56,76 54,84 56,92 C 60,100 66,104 74,104 C 80,104 84,100 84,94
           C 84,86 80,78 72,74 Z"
        fill={mFill("f-pec", active)} stroke={mStroke("f-pec", active)} strokeWidth={mw("f-pec", active)}
      />
      <path
        d="M 116,72 C 120,76 122,84 120,92 C 116,100 110,104 102,104
           C 96,104 92,100 92,94 C 92,86 96,78 104,74 Z"
        fill={mFill("f-pec", active)} stroke={mStroke("f-pec", active)} strokeWidth={mw("f-pec", active)}
      />

      {/* ── Front deltoids ── */}
      <path
        d="M 48,68 C 42,70 38,78 40,86 C 42,90 46,92 50,90 C 54,86 56,80 54,74 Z"
        fill={mFill("f-delt", active)} stroke={mStroke("f-delt", active)} strokeWidth={mw("f-delt", active)}
      />
      <path
        d="M 128,68 C 134,70 138,78 136,86 C 134,90 130,92 126,90
           C 122,86 120,80 122,74 Z"
        fill={mFill("f-delt", active)} stroke={mStroke("f-delt", active)} strokeWidth={mw("f-delt", active)}
      />

      {/* ── Biceps ── */}
      <path
        d="M 34,104 C 28,108 24,118 26,128 C 28,136 34,140 38,138 C 40,132 40,122 38,114 Z"
        fill={mFill("f-bicep", active)} stroke={mStroke("f-bicep", active)} strokeWidth={mw("f-bicep", active)}
      />
      <path
        d="M 142,104 C 148,108 152,118 150,128 C 148,136 142,140 138,138
           C 136,132 136,122 138,114 Z"
        fill={mFill("f-bicep", active)} stroke={mStroke("f-bicep", active)} strokeWidth={mw("f-bicep", active)}
      />

      {/* ── Forearms ── */}
      <path
        d="M 24,136 C 20,142 18,152 20,162 C 22,168 26,170 28,168 C 30,162 30,150 28,140 Z"
        fill={mFill("f-forearm", active)} stroke={mStroke("f-forearm", active)} strokeWidth={mw("f-forearm", active)}
      />
      <path
        d="M 152,136 C 156,142 158,152 156,162 C 154,168 150,170 148,168
           C 146,162 146,150 148,140 Z"
        fill={mFill("f-forearm", active)} stroke={mStroke("f-forearm", active)} strokeWidth={mw("f-forearm", active)}
      />

      {/* ── Abs (segmented) ── */}
      {/* Upper pair */}
      <path d="M 80,106 C 78,112 78,118 80,122 C 84,124 86,122 86,118 C 86,112 84,108 80,106 Z"
        fill={mFill("f-abs", active)} stroke={mStroke("f-abs", active)} strokeWidth={mw("f-abs", active)} />
      <path d="M 96,106 C 98,112 98,118 96,122 C 92,124 90,122 90,118 C 90,112 92,108 96,106 Z"
        fill={mFill("f-abs", active)} stroke={mStroke("f-abs", active)} strokeWidth={mw("f-abs", active)} />
      {/* Mid pair */}
      <path d="M 80,124 C 78,130 78,136 80,140 C 84,142 86,140 86,136 C 86,130 84,126 80,124 Z"
        fill={mFill("f-abs", active)} stroke={mStroke("f-abs", active)} strokeWidth={mw("f-abs", active)} />
      <path d="M 96,124 C 98,130 98,136 96,140 C 92,142 90,140 90,136 C 90,130 92,126 96,124 Z"
        fill={mFill("f-abs", active)} stroke={mStroke("f-abs", active)} strokeWidth={mw("f-abs", active)} />
      {/* Lower pair */}
      <path d="M 80,142 C 78,148 78,154 82,156 C 85,156 86,154 86,150 C 86,146 84,143 80,142 Z"
        fill={mFill("f-abs", active)} stroke={mStroke("f-abs", active)} strokeWidth={mw("f-abs", active)} />
      <path d="M 96,142 C 98,148 98,154 94,156 C 91,156 90,154 90,150 C 90,146 92,143 96,142 Z"
        fill={mFill("f-abs", active)} stroke={mStroke("f-abs", active)} strokeWidth={mw("f-abs", active)} />

      {/* ── Obliques ── */}
      <path d="M 72,108 C 66,116 64,128 66,140 C 68,148 72,152 76,150 C 78,144 78,132 76,120 Z"
        fill={mFill("f-oblique", active)} stroke={mStroke("f-oblique", active)} strokeWidth={mw("f-oblique", active)} />
      <path d="M 104,108 C 110,116 112,128 110,140 C 108,148 104,152 100,150 C 98,144 98,132 100,120 Z"
        fill={mFill("f-oblique", active)} stroke={mStroke("f-oblique", active)} strokeWidth={mw("f-oblique", active)} />

      {/* ── Hip flexors ── */}
      <path d="M 74,156 C 70,162 70,170 74,174 C 78,176 82,174 82,170 C 82,164 80,158 76,156 Z"
        fill={mFill("f-hipflex", active)} stroke={mStroke("f-hipflex", active)} strokeWidth={mw("f-hipflex", active)} />
      <path d="M 102,156 C 106,162 106,170 102,174 C 98,176 94,174 94,170 C 94,164 96,158 100,156 Z"
        fill={mFill("f-hipflex", active)} stroke={mStroke("f-hipflex", active)} strokeWidth={mw("f-hipflex", active)} />

      {/* ── Quads ── */}
      <path
        d="M 64,176 C 58,184 56,198 58,214 C 60,228 64,238 70,242 C 76,244 80,240 80,234
           C 80,220 78,204 74,188 Z"
        fill={mFill("f-quad", active)} stroke={mStroke("f-quad", active)} strokeWidth={mw("f-quad", active)}
      />
      <path
        d="M 112,176 C 118,184 120,198 118,214 C 116,228 112,238 106,242
           C 100,244 96,240 96,234 C 96,220 98,204 102,188 Z"
        fill={mFill("f-quad", active)} stroke={mStroke("f-quad", active)} strokeWidth={mw("f-quad", active)}
      />
      {/* VMO teardrop */}
      <path d="M 72,238 C 68,244 68,252 72,256 C 76,258 80,256 80,250 C 80,244 78,238 74,236 Z"
        fill={mFill("f-quad", active)} stroke={mStroke("f-quad", active)} strokeWidth={mw("f-quad", active)} />
      <path d="M 104,238 C 108,244 108,252 104,256 C 100,258 96,256 96,250 C 96,244 98,238 102,236 Z"
        fill={mFill("f-quad", active)} stroke={mStroke("f-quad", active)} strokeWidth={mw("f-quad", active)} />

      {/* ── Front calves (tibialis) ── */}
      <path
        d="M 56,294 C 52,304 52,318 54,330 C 56,338 60,342 64,340
           C 66,332 66,316 64,302 Z"
        fill={mFill("f-calf", active)} stroke={mStroke("f-calf", active)} strokeWidth={mw("f-calf", active)}
      />
      <path
        d="M 120,294 C 124,304 124,318 122,330 C 120,338 116,342 112,340
           C 110,332 110,316 112,302 Z"
        fill={mFill("f-calf", active)} stroke={mStroke("f-calf", active)} strokeWidth={mw("f-calf", active)}
      />

      {/* ── Knee caps ── */}
      <ellipse cx="72" cy="266" rx="12" ry="8" fill={C.bone} stroke={C.skinDark} strokeWidth={0.8} />
      <ellipse cx="104" cy="266" rx="12" ry="8" fill={C.bone} stroke={C.skinDark} strokeWidth={0.8} />

      {/* ── Linea alba ── */}
      <line x1="88" y1="104" x2="88" y2="158" stroke="#1a1a1e" strokeWidth={1} />
      {/* Tendinous inscriptions */}
      <path d="M 78,122 Q 88,124 98,122" fill="none" stroke="#1a1a1e" strokeWidth={0.8} />
      <path d="M 78,140 Q 88,142 98,140" fill="none" stroke="#1a1a1e" strokeWidth={0.8} />
    </svg>
  );
}

// ─── BACK VIEW ─────────────────────────────────────────────────────────────
function BackBody({ active }: { active: Set<MuscleId> }) {
  return (
    <svg
      viewBox="0 0 200 480"
      width="120"
      height="288"
      aria-label="Back muscle diagram"
      style={{ display: "block" }}
    >
      <defs>
        <radialGradient id="skinGradB" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#d4b896" />
          <stop offset="100%" stopColor="#b8966e" />
        </radialGradient>
      </defs>

      {/* ── Body silhouette (mirrored) ── */}
      <path
        d="
          M 88,8 C 76,8 68,16 68,26 C 68,38 74,46 88,50 C 102,46 108,38 108,26 C 108,16 100,8 88,8 Z
          M 76,50 C 64,52 52,58 46,68 C 40,78 40,90 42,100 L 36,104 C 28,108 22,116 20,126
          L 18,152 L 24,152 L 26,136 C 28,128 32,122 38,120 L 40,158 C 36,162 34,168 34,176
          L 34,210 L 40,210 L 40,178 C 40,172 42,166 46,162 L 48,210 L 54,210
          L 54,162 C 58,166 60,172 60,178 L 60,210 L 66,210 L 66,176
          C 66,168 64,162 60,158 L 62,120 C 68,122 72,128 74,136 L 76,210 L 82,210
          L 82,136 C 82,128 80,122 76,118 L 76,100 C 80,90 82,78 82,68
          L 80,60 L 88,58 L 96,60 L 94,68 C 94,78 96,90 100,100 L 100,118
          C 96,122 94,128 94,136 L 94,210 L 100,210 L 102,136 C 104,128 108,122
          114,120 L 116,158 C 112,162 110,168 110,176 L 110,210 L 116,210
          L 116,178 C 116,172 118,166 122,162 L 124,210 L 130,210 L 132,162
          C 136,166 138,172 138,178 L 138,210 L 144,210 L 144,176
          C 144,168 142,162 138,158 L 140,120 C 146,122 150,128 152,136
          L 154,152 L 160,152 L 158,126 C 156,116 150,108 142,104 L 136,100
          C 138,90 138,78 132,68 C 126,58 114,52 100,50 Z
        "
        fill="url(#skinGradB)"
        stroke={C.skinDark}
        strokeWidth={1}
      />

      {/* ── Neck ── */}
      <path d="M 82,48 C 82,54 84,58 88,60 C 92,58 94,54 94,48 Z"
        fill={C.skin} stroke={C.skinDark} strokeWidth={0.5} />

      {/* ── Trapezius ── */}
      <path
        d="M 80,50 C 70,54 60,62 52,70 C 60,74 72,76 88,76 C 104,76 116,74 124,70
           C 116,62 106,54 96,50 Z"
        fill={mFill("b-trap", active)} stroke={mStroke("b-trap", active)} strokeWidth={mw("b-trap", active)}
      />

      {/* ── Rear deltoids ── */}
      <path d="M 46,68 C 40,72 36,80 38,90 C 40,96 46,98 50,96 C 54,90 54,80 50,72 Z"
        fill={mFill("b-delt", active)} stroke={mStroke("b-delt", active)} strokeWidth={mw("b-delt", active)} />
      <path d="M 130,68 C 136,72 140,80 138,90 C 136,96 130,98 126,96 C 122,90 122,80 126,72 Z"
        fill={mFill("b-delt", active)} stroke={mStroke("b-delt", active)} strokeWidth={mw("b-delt", active)} />

      {/* ── Triceps ── */}
      <path d="M 36,102 C 28,108 24,120 26,132 C 28,140 34,144 38,142 C 40,134 40,120 38,110 Z"
        fill={mFill("b-tricep", active)} stroke={mStroke("b-tricep", active)} strokeWidth={mw("b-tricep", active)} />
      <path d="M 140,102 C 148,108 152,120 150,132 C 148,140 142,144 138,142 C 136,134 136,120 138,110 Z"
        fill={mFill("b-tricep", active)} stroke={mStroke("b-tricep", active)} strokeWidth={mw("b-tricep", active)} />

      {/* ── Lats ── */}
      <path
        d="M 50,74 C 42,82 40,96 42,112 C 44,124 50,132 58,134 C 64,134 68,130 68,124
           C 66,110 62,94 56,80 Z"
        fill={mFill("b-lat", active)} stroke={mStroke("b-lat", active)} strokeWidth={mw("b-lat", active)}
      />
      <path
        d="M 126,74 C 134,82 136,96 134,112 C 132,124 126,132 118,134
           C 112,134 108,130 108,124 C 110,110 114,94 120,80 Z"
        fill={mFill("b-lat", active)} stroke={mStroke("b-lat", active)} strokeWidth={mw("b-lat", active)}
      />

      {/* ── Erector spinae ── */}
      <path d="M 80,76 C 78,90 78,110 80,128 C 82,136 84,140 86,138 C 88,136 88,128 86,114 C 84,98 82,84 82,76 Z"
        fill={mFill("b-erector", active)} stroke={mStroke("b-erector", active)} strokeWidth={mw("b-erector", active)} />
      <path d="M 96,76 C 98,90 98,110 96,128 C 94,136 92,140 90,138 C 88,136 88,128 90,114 C 92,98 94,84 94,76 Z"
        fill={mFill("b-erector", active)} stroke={mStroke("b-erector", active)} strokeWidth={mw("b-erector", active)} />

      {/* ── Spine line ── */}
      <line x1="88" y1="76" x2="88" y2="158" stroke="#1a1a1e" strokeWidth={1} />

      {/* ── Glutes ── */}
      <path
        d="M 66,158 C 58,164 54,176 56,190 C 58,202 64,210 72,212
           C 80,212 84,206 84,198 C 84,184 78,168 70,158 Z"
        fill={mFill("b-glute", active)} stroke={mStroke("b-glute", active)} strokeWidth={mw("b-glute", active)}
      />
      <path
        d="M 110,158 C 118,164 122,176 120,190 C 118,202 112,210 104,212
           C 96,212 92,206 92,198 C 92,184 98,168 106,158 Z"
        fill={mFill("b-glute", active)} stroke={mStroke("b-glute", active)} strokeWidth={mw("b-glute", active)}
      />
      {/* Glute crease */}
      <path d="M 58,210 Q 88,218 118,210" fill="none" stroke="#1a1a1e" strokeWidth={1} />

      {/* ── Hamstrings ── */}
      <path
        d="M 60,214 C 54,224 52,240 54,258 C 56,270 62,278 68,278
           C 74,278 78,272 78,264 C 76,248 70,230 64,216 Z"
        fill={mFill("b-ham", active)} stroke={mStroke("b-ham", active)} strokeWidth={mw("b-ham", active)}
      />
      <path
        d="M 116,214 C 122,224 124,240 122,258 C 120,270 114,278 108,278
           C 102,278 98,272 98,264 C 100,248 106,230 112,216 Z"
        fill={mFill("b-ham", active)} stroke={mStroke("b-ham", active)} strokeWidth={mw("b-ham", active)}
      />

      {/* ── Knee backs ── */}
      <ellipse cx="70" cy="284" rx="12" ry="7" fill={C.bone} stroke={C.skinDark} strokeWidth={0.8} />
      <ellipse cx="106" cy="284" rx="12" ry="7" fill={C.bone} stroke={C.skinDark} strokeWidth={0.8} />

      {/* ── Calves (gastrocnemius) ── */}
      <path
        d="M 56,292 C 50,304 50,322 52,338 C 54,348 58,354 64,352
           C 68,346 68,328 66,310 Z"
        fill={mFill("b-calf", active)} stroke={mStroke("b-calf", active)} strokeWidth={mw("b-calf", active)}
      />
      {/* lateral head */}
      <path
        d="M 68,292 C 72,306 72,324 70,340 C 68,350 64,354 62,350
           C 62,338 64,316 66,298 Z"
        fill={mFill("b-calf", active)} stroke={mStroke("b-calf", active)} strokeWidth={mw("b-calf", active)}
      />
      <path
        d="M 120,292 C 126,304 126,322 124,338 C 122,348 118,354 112,352
           C 108,346 108,328 110,310 Z"
        fill={mFill("b-calf", active)} stroke={mStroke("b-calf", active)} strokeWidth={mw("b-calf", active)}
      />
      <path
        d="M 108,292 C 104,306 104,324 106,340 C 108,350 112,354 114,350
           C 114,338 112,316 110,298 Z"
        fill={mFill("b-calf", active)} stroke={mStroke("b-calf", active)} strokeWidth={mw("b-calf", active)}
      />
    </svg>
  );
}

// ─── Public component ────────────────────────────────────────────────────────
export function MuscleDiagram({ muscles }: { muscles: string[] }) {
  const active = resolve(muscles);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Front</p>
          <div className="rounded-xl bg-zinc-900 p-2">
            <FrontBody active={active} />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Back</p>
          <div className="rounded-xl bg-zinc-900 p-2">
            <BackBody active={active} />
          </div>
        </div>
        {/* Legend */}
        <div className="flex flex-col justify-start gap-2 pt-6">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm" style={{ background: "#f97316" }} />
            <span className="text-xs text-zinc-300">Targeted</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-zinc-700" />
            <span className="text-xs text-zinc-500">Other</span>
          </div>
          <div className="mt-3 space-y-1">
            {muscles.map((m) => (
              <p key={m} className="text-xs capitalize" style={{ color: "#f97316" }}>• {m}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
