"use client";

// Anatomically-shaped SVG muscle diagram — front & back views
// Active muscles highlighted in coral gradient; inactive in zinc-800

const MUSCLE_MAP: Record<string, string[]> = {
  chest: ["f-pec-l", "f-pec-r"],
  pectorals: ["f-pec-l", "f-pec-r"],
  "pectoralis major": ["f-pec-l", "f-pec-r"],
  "pec minor": ["f-pec-l", "f-pec-r"],
  shoulders: ["f-delt-l", "f-delt-r", "b-delt-l", "b-delt-r"],
  deltoids: ["f-delt-l", "f-delt-r", "b-delt-l", "b-delt-r"],
  "front deltoid": ["f-delt-l", "f-delt-r"],
  "rear deltoid": ["b-delt-l", "b-delt-r"],
  biceps: ["f-bicep-l", "f-bicep-r"],
  "biceps brachii": ["f-bicep-l", "f-bicep-r"],
  forearms: ["f-forearm-l", "f-forearm-r"],
  abs: ["f-abs"],
  core: ["f-abs", "f-oblique-l", "f-oblique-r"],
  "rectus abdominis": ["f-abs"],
  obliques: ["f-oblique-l", "f-oblique-r"],
  "external obliques": ["f-oblique-l", "f-oblique-r"],
  quads: ["f-quad-l", "f-quad-r"],
  quadriceps: ["f-quad-l", "f-quad-r"],
  "hip flexors": ["f-hipflex-l", "f-hipflex-r"],
  calves: ["b-calf-l", "b-calf-r", "f-calf-l", "f-calf-r"],
  "gastrocnemius": ["b-calf-l", "b-calf-r"],
  glutes: ["b-glute-l", "b-glute-r"],
  "gluteus maximus": ["b-glute-l", "b-glute-r"],
  "glute max": ["b-glute-l", "b-glute-r"],
  hamstrings: ["b-ham-l", "b-ham-r"],
  back: ["b-lats-l", "b-lats-r", "b-traps"],
  lats: ["b-lats-l", "b-lats-r"],
  "latissimus dorsi": ["b-lats-l", "b-lats-r"],
  traps: ["b-traps"],
  trapezius: ["b-traps"],
  triceps: ["b-tricep-l", "b-tricep-r"],
  "triceps brachii": ["b-tricep-l", "b-tricep-r"],
  "lower back": ["b-erector"],
  erectors: ["b-erector"],
  "erector spinae": ["b-erector"],
  "pelvic floor": ["f-hipflex-l", "f-hipflex-r"],
  "transverse abdominis": ["f-abs"],
};

function resolveIds(muscles: string[]): Set<string> {
  const ids = new Set<string>();
  for (const m of muscles) {
    const key = m.toLowerCase().trim();
    const mapped = MUSCLE_MAP[key];
    if (mapped) mapped.forEach((id) => ids.add(id));
  }
  return ids;
}

const INACTIVE = "#27272a";
const INACTIVE_STROKE = "#3f3f46";
const ACTIVE = "url(#muscleGrad)";
const ACTIVE_STROKE = "#ef5c35";
const BODY_BASE = "#3f3f46";
const BODY_STROKE = "#52525b";

type ShapeProps = { id: string; active: Set<string>; d: string };
function M({ id, active, d }: ShapeProps) {
  const on = active.has(id);
  return (
    <path
      d={d}
      fill={on ? ACTIVE : INACTIVE}
      stroke={on ? ACTIVE_STROKE : INACTIVE_STROKE}
      strokeWidth={on ? 0.8 : 0.5}
    />
  );
}

// ─── FRONT SVG (viewBox 0 0 100 220) ────────────────────────────────────────
function FrontBody({ active }: { active: Set<string> }) {
  return (
    <svg viewBox="0 0 100 220" width={110} height={220} aria-label="Front muscle diagram">
      <defs>
        <linearGradient id="muscleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ef5c35" />
        </linearGradient>
      </defs>

      {/* ── Torso base ── */}
      <path d="M28,38 Q16,42 15,56 Q14,72 18,80 Q22,88 26,90 L32,90 Q30,80 30,70 L30,52 L70,52 L70,70 Q70,80 68,90 L74,90 Q78,88 82,80 Q86,72 85,56 Q84,42 72,38 Z"
        fill={BODY_BASE} stroke={BODY_STROKE} strokeWidth={0.5} />

      {/* ── Head ── */}
      <ellipse cx="50" cy="12" rx="12" ry="11" fill={BODY_BASE} stroke={BODY_STROKE} strokeWidth={0.5} />
      {/* Neck */}
      <path d="M44,22 Q44,28 42,32 L58,32 Q56,28 56,22 Z" fill={BODY_BASE} stroke={BODY_STROKE} strokeWidth={0.5} />
      {/* Clavicles */}
      <path d="M42,34 Q36,36 28,38" fill="none" stroke={BODY_STROKE} strokeWidth={0.8} />
      <path d="M58,34 Q64,36 72,38" fill="none" stroke={BODY_STROKE} strokeWidth={0.8} />

      {/* ── Deltoids (front) ── */}
      <M id="f-delt-l" active={active} d="M15,40 Q10,42 9,50 Q9,56 13,58 Q17,56 19,52 Q20,46 18,40 Z" />
      <M id="f-delt-r" active={active} d="M85,40 Q90,42 91,50 Q91,56 87,58 Q83,56 81,52 Q80,46 82,40 Z" />

      {/* ── Pectorals ── */}
      <M id="f-pec-l" active={active} d="M30,38 Q24,42 22,50 Q22,58 26,62 Q30,64 34,60 Q36,54 36,46 Q34,40 30,38 Z" />
      <M id="f-pec-r" active={active} d="M70,38 Q76,42 78,50 Q78,58 74,62 Q70,64 66,60 Q64,54 64,46 Q66,40 70,38 Z" />

      {/* ── Biceps ── */}
      <M id="f-bicep-l" active={active} d="M9,56 Q6,60 6,68 Q6,76 9,80 Q12,82 14,80 Q16,76 16,68 Q16,60 13,56 Z" />
      <M id="f-bicep-r" active={active} d="M91,56 Q94,60 94,68 Q94,76 91,80 Q88,82 86,80 Q84,76 84,68 Q84,60 87,56 Z" />

      {/* ── Forearms ── */}
      <M id="f-forearm-l" active={active} d="M9,82 Q6,86 7,98 Q8,106 11,108 Q14,106 15,98 Q16,88 14,82 Z" />
      <M id="f-forearm-r" active={active} d="M91,82 Q94,86 93,98 Q92,106 89,108 Q86,106 85,98 Q84,88 86,82 Z" />

      {/* ── Serratus / rib outline ── */}
      <path d="M26,62 Q24,68 26,74 M34,64 Q32,70 34,76" fill="none" stroke={BODY_STROKE} strokeWidth={0.4} />
      <path d="M74,62 Q76,68 74,74 M66,64 Q68,70 66,76" fill="none" stroke={BODY_STROKE} strokeWidth={0.4} />

      {/* ── Obliques ── */}
      <M id="f-oblique-l" active={active} d="M22,60 Q18,68 20,80 Q22,88 28,90 Q30,82 30,72 Q28,64 24,60 Z" />
      <M id="f-oblique-r" active={active} d="M78,60 Q82,68 80,80 Q78,88 72,90 Q70,82 70,72 Q72,64 76,60 Z" />

      {/* ── Abs (rectus abdominis) — segmented ── */}
      <M id="f-abs" active={active} d="
        M36,52 L64,52 L64,90 Q57,92 50,92 Q43,92 36,90 Z
      " />
      {/* Linea alba + tendinous inscriptions */}
      {[58, 66, 74, 82].map((y) => (
        <line key={y} x1="36" y1={y} x2="64" y2={y} stroke="#18181b" strokeWidth={0.8} />
      ))}
      <line x1="50" y1="52" x2="50" y2="90" stroke="#18181b" strokeWidth={0.8} />

      {/* ── Hip flexors ── */}
      <M id="f-hipflex-l" active={active} d="M36,90 Q30,94 30,102 Q34,106 38,104 Q42,100 42,92 Z" />
      <M id="f-hipflex-r" active={active} d="M64,90 Q70,94 70,102 Q66,106 62,104 Q58,100 58,92 Z" />

      {/* ── Pelvis/hip outline ── */}
      <path d="M28,90 Q26,96 28,100 L72,100 Q74,96 72,90 Z" fill={BODY_BASE} stroke={BODY_STROKE} strokeWidth={0.5} />

      {/* ── Quads ── */}
      <M id="f-quad-l" active={active} d="M28,100 Q24,108 24,124 Q24,136 28,142 Q34,144 38,140 Q40,130 40,118 Q40,106 38,100 Z" />
      <M id="f-quad-r" active={active} d="M72,100 Q76,108 76,124 Q76,136 72,142 Q66,144 62,140 Q60,130 60,118 Q60,106 62,100 Z" />
      {/* Quad separation line */}
      <line x1="33" y1="105" x2="30" y2="140" stroke="#18181b" strokeWidth={0.5} />
      <line x1="67" y1="105" x2="70" y2="140" stroke="#18181b" strokeWidth={0.5} />

      {/* ── Knees ── */}
      <ellipse cx="34" cy="146" rx="8" ry="6" fill={BODY_BASE} stroke={BODY_STROKE} strokeWidth={0.5} />
      <ellipse cx="66" cy="146" rx="8" ry="6" fill={BODY_BASE} stroke={BODY_STROKE} strokeWidth={0.5} />

      {/* ── Tibialis / front shin ── */}
      <path d="M28,152 Q26,162 27,176 Q28,182 32,182 Q36,182 37,176 Q38,162 36,152 Z" fill={BODY_BASE} stroke={BODY_STROKE} strokeWidth={0.5} />
      <path d="M72,152 Q74,162 73,176 Q72,182 68,182 Q64,182 63,176 Q62,162 64,152 Z" fill={BODY_BASE} stroke={BODY_STROKE} strokeWidth={0.5} />

      {/* ── Calves (front visible portion) ── */}
      <M id="f-calf-l" active={active} d="M26,152 Q22,158 22,170 Q22,180 26,184 Q30,186 34,182 Q36,174 36,164 Q36,156 32,152 Z" />
      <M id="f-calf-r" active={active} d="M74,152 Q78,158 78,170 Q78,180 74,184 Q70,186 66,182 Q64,174 64,164 Q64,156 68,152 Z" />

      {/* ── Ankles & feet ── */}
      <ellipse cx="32" cy="188" rx="7" ry="4" fill={BODY_BASE} stroke={BODY_STROKE} strokeWidth={0.5} />
      <ellipse cx="68" cy="188" rx="7" ry="4" fill={BODY_BASE} stroke={BODY_STROKE} strokeWidth={0.5} />
    </svg>
  );
}

// ─── BACK SVG (viewBox 0 0 100 220) ─────────────────────────────────────────
function BackBody({ active }: { active: Set<string> }) {
  return (
    <svg viewBox="0 0 100 220" width={110} height={220} aria-label="Back muscle diagram">
      <defs>
        <linearGradient id="muscleGradB" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ef5c35" />
        </linearGradient>
      </defs>

      {/* ── Torso base ── */}
      <path d="M28,38 Q16,42 15,56 Q14,72 18,80 Q22,88 26,90 L32,90 Q30,80 30,70 L30,52 L70,52 L70,70 Q70,80 68,90 L74,90 Q78,88 82,80 Q86,72 85,56 Q84,42 72,38 Z"
        fill={BODY_BASE} stroke={BODY_STROKE} strokeWidth={0.5} />

      {/* ── Head ── */}
      <ellipse cx="50" cy="12" rx="12" ry="11" fill={BODY_BASE} stroke={BODY_STROKE} strokeWidth={0.5} />
      {/* Neck */}
      <path d="M44,22 Q44,28 42,32 L58,32 Q56,28 56,22 Z" fill={BODY_BASE} stroke={BODY_STROKE} strokeWidth={0.5} />

      {/* ── Trapezius ── */}
      <M id="b-traps" active={active} d="M42,24 Q36,28 28,38 Q36,42 50,44 Q64,42 72,38 Q64,28 58,24 Z" />
      {/* Spine line */}
      <line x1="50" y1="38" x2="50" y2="90" stroke="#18181b" strokeWidth={0.8} />

      {/* ── Rear Deltoids ── */}
      <M id="b-delt-l" active={active} d="M15,40 Q10,42 9,50 Q9,56 13,58 Q17,56 19,52 Q20,46 18,40 Z" />
      <M id="b-delt-r" active={active} d="M85,40 Q90,42 91,50 Q91,56 87,58 Q83,56 81,52 Q80,46 82,40 Z" />

      {/* ── Triceps ── */}
      <M id="b-tricep-l" active={active} d="M9,56 Q6,62 7,72 Q7,80 10,82 Q13,82 15,78 Q16,70 15,62 Q13,58 11,56 Z" />
      <M id="b-tricep-r" active={active} d="M91,56 Q94,62 93,72 Q93,80 90,82 Q87,82 85,78 Q84,70 85,62 Q87,58 89,56 Z" />

      {/* ── Lats ── */}
      <M id="b-lats-l" active={active} d="M18,44 Q14,52 15,68 Q16,78 22,84 Q28,88 32,86 Q30,76 30,62 Q30,50 26,44 Z" />
      <M id="b-lats-r" active={active} d="M82,44 Q86,52 85,68 Q84,78 78,84 Q72,88 68,86 Q70,76 70,62 Q70,50 74,44 Z" />

      {/* ── Erector spinae (lower back) ── */}
      <M id="b-erector" active={active} d="M42,62 Q40,68 40,80 Q40,88 42,90 L46,90 L46,62 Z" />
      <M id="b-erector" active={active} d="M58,62 Q60,68 60,80 Q60,88 58,90 L54,90 L54,62 Z" />

      {/* ── Pelvis ── */}
      <path d="M28,90 Q26,96 28,100 L72,100 Q74,96 72,90 Z" fill={BODY_BASE} stroke={BODY_STROKE} strokeWidth={0.5} />

      {/* ── Glutes ── */}
      <M id="b-glute-l" active={active} d="M28,98 Q22,104 22,116 Q22,126 28,130 Q34,132 40,128 Q42,120 42,110 Q40,100 34,98 Z" />
      <M id="b-glute-r" active={active} d="M72,98 Q78,104 78,116 Q78,126 72,130 Q66,132 60,128 Q58,120 58,110 Q60,100 66,98 Z" />
      {/* Glute crease */}
      <path d="M28,130 Q50,136 72,130" fill="none" stroke="#18181b" strokeWidth={0.8} />

      {/* ── Hamstrings ── */}
      <M id="b-ham-l" active={active} d="M26,132 Q22,140 22,156 Q22,166 26,170 Q32,172 36,168 Q38,158 38,146 Q38,136 34,132 Z" />
      <M id="b-ham-r" active={active} d="M74,132 Q78,140 78,156 Q78,166 74,170 Q68,172 64,168 Q62,158 62,146 Q62,136 66,132 Z" />
      {/* Ham separation */}
      <line x1="32" y1="135" x2="30" y2="168" stroke="#18181b" strokeWidth={0.5} />
      <line x1="68" y1="135" x2="70" y2="168" stroke="#18181b" strokeWidth={0.5} />

      {/* ── Knees (back) ── */}
      <ellipse cx="32" cy="174" rx="8" ry="5" fill={BODY_BASE} stroke={BODY_STROKE} strokeWidth={0.5} />
      <ellipse cx="68" cy="174" rx="8" ry="5" fill={BODY_BASE} stroke={BODY_STROKE} strokeWidth={0.5} />

      {/* ── Calves (gastrocnemius) ── */}
      <M id="b-calf-l" active={active} d="M24,178 Q22,186 22,198 Q22,206 26,210 Q30,212 34,208 Q36,200 36,190 Q36,182 32,178 Z" />
      <M id="b-calf-r" active={active} d="M76,178 Q78,186 78,198 Q78,206 74,210 Q70,212 66,208 Q64,200 64,190 Q64,182 68,178 Z" />
      {/* Calf split */}
      <path d="M28,182 Q32,192 32,204" fill="none" stroke="#18181b" strokeWidth={0.5} />
      <path d="M72,182 Q68,192 68,204" fill="none" stroke="#18181b" strokeWidth={0.5} />

      {/* ── Achilles / ankles ── */}
      <ellipse cx="30" cy="212" rx="6" ry="4" fill={BODY_BASE} stroke={BODY_STROKE} strokeWidth={0.5} />
      <ellipse cx="70" cy="212" rx="6" ry="4" fill={BODY_BASE} stroke={BODY_STROKE} strokeWidth={0.5} />
    </svg>
  );
}

export function MuscleDiagram({ muscles }: { muscles: string[] }) {
  const active = resolveIds(muscles);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start gap-6">
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Front</p>
          <FrontBody active={active} />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Back</p>
          <BackBody active={active} />
        </div>
        {/* Legend */}
        <div className="flex flex-col justify-start gap-2 pt-6">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-coral-500" />
            <span className="text-xs text-zinc-300">Primary</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-zinc-800 ring-1 ring-zinc-600" />
            <span className="text-xs text-zinc-500">Inactive</span>
          </div>
          <div className="mt-3 space-y-1">
            {muscles.map((m) => (
              <p key={m} className="text-xs capitalize text-coral-400">• {m}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
