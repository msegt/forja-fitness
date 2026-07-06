"use client";

// SVG body-map muscle diagram
// Highlighted muscles are shown in coral; inactive in zinc-700

const MUSCLE_MAP: Record<string, string[]> = {
  // Front
  chest: ["chest-l", "chest-r"],
  pectorals: ["chest-l", "chest-r"],
  "pec minor": ["chest-l", "chest-r"],
  shoulders: ["shoulder-l", "shoulder-r"],
  deltoids: ["shoulder-l", "shoulder-r"],
  "front deltoid": ["shoulder-l", "shoulder-r"],
  biceps: ["bicep-l", "bicep-r"],
  "biceps brachii": ["bicep-l", "bicep-r"],
  abs: ["abs-upper", "abs-lower"],
  core: ["abs-upper", "abs-lower"],
  "rectus abdominis": ["abs-upper", "abs-lower"],
  obliques: ["oblique-l", "oblique-r"],
  quads: ["quad-l", "quad-r"],
  quadriceps: ["quad-l", "quad-r"],
  "hip flexors": ["hipflexor-l", "hipflexor-r"],
  // Back
  glutes: ["glute-l", "glute-r"],
  "glute max": ["glute-l", "glute-r"],
  hamstrings: ["hamstring-l", "hamstring-r"],
  calves: ["calf-l", "calf-r"],
  back: ["lats-l", "lats-r", "traps"],
  lats: ["lats-l", "lats-r"],
  "latissimus dorsi": ["lats-l", "lats-r"],
  traps: ["traps"],
  trapezius: ["traps"],
  triceps: ["tricep-l", "tricep-r"],
  "triceps brachii": ["tricep-l", "tricep-r"],
  "lower back": ["lower-back"],
  erectors: ["lower-back"],
  "pelvic floor": ["abs-lower"],
  "transverse abdominis": ["abs-lower"],
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

function fill(id: string, active: Set<string>) {
  return active.has(id) ? "#ef5c35" : "#3f3f46";
}

export function MuscleDiagram({ muscles }: { muscles: string[] }) {
  const active = resolveIds(muscles);

  return (
    <div className="flex flex-wrap gap-4">
      {/* FRONT VIEW */}
      <div className="flex flex-col items-center gap-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Front</p>
        <svg viewBox="0 0 80 160" width={80} height={160} aria-label="Front body muscle diagram">
          {/* Head */}
          <ellipse cx="40" cy="14" rx="11" ry="13" fill="#52525b" />
          {/* Neck */}
          <rect x="36" y="26" width="8" height="8" rx="2" fill="#52525b" />
          {/* Shoulders */}
          <ellipse id="shoulder-l" cx="21" cy="38" rx="9" ry="7" fill={fill("shoulder-l", active)} />
          <ellipse id="shoulder-r" cx="59" cy="38" rx="9" ry="7" fill={fill("shoulder-r", active)} />
          {/* Chest */}
          <ellipse id="chest-l" cx="32" cy="44" rx="10" ry="8" fill={fill("chest-l", active)} />
          <ellipse id="chest-r" cx="48" cy="44" rx="10" ry="8" fill={fill("chest-r", active)} />
          {/* Biceps */}
          <rect id="bicep-l" x="10" y="44" width="8" height="20" rx="4" fill={fill("bicep-l", active)} />
          <rect id="bicep-r" x="62" y="44" width="8" height="20" rx="4" fill={fill("bicep-r", active)} />
          {/* Obliques */}
          <ellipse id="oblique-l" cx="27" cy="62" rx="6" ry="10" fill={fill("oblique-l", active)} />
          <ellipse id="oblique-r" cx="53" cy="62" rx="6" ry="10" fill={fill("oblique-r", active)} />
          {/* Abs upper */}
          <rect id="abs-upper" x="33" y="53" width="14" height="12" rx="3" fill={fill("abs-upper", active)} />
          {/* Abs lower / hip flexors */}
          <rect id="abs-lower" x="33" y="66" width="14" height="10" rx="3" fill={fill("abs-lower", active)} />
          {/* Hip flexors */}
          <ellipse id="hipflexor-l" cx="31" cy="80" rx="6" ry="5" fill={fill("hipflexor-l", active)} />
          <ellipse id="hipflexor-r" cx="49" cy="80" rx="6" ry="5" fill={fill("hipflexor-r", active)} />
          {/* Quads */}
          <rect id="quad-l" x="25" y="88" width="12" height="30" rx="5" fill={fill("quad-l", active)} />
          <rect id="quad-r" x="43" y="88" width="12" height="30" rx="5" fill={fill("quad-r", active)} />
          {/* Calves front */}
          <rect id="calf-l" x="26" y="122" width="10" height="24" rx="5" fill={fill("calf-l", active)} />
          <rect id="calf-r" x="44" y="122" width="10" height="24" rx="5" fill={fill("calf-r", active)} />
        </svg>
      </div>

      {/* BACK VIEW */}
      <div className="flex flex-col items-center gap-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Back</p>
        <svg viewBox="0 0 80 160" width={80} height={160} aria-label="Back body muscle diagram">
          {/* Head */}
          <ellipse cx="40" cy="14" rx="11" ry="13" fill="#52525b" />
          {/* Neck */}
          <rect x="36" y="26" width="8" height="8" rx="2" fill="#52525b" />
          {/* Traps */}
          <ellipse id="traps" cx="40" cy="36" rx="14" ry="7" fill={fill("traps", active)} />
          {/* Shoulders back */}
          <ellipse id="shoulder-l" cx="21" cy="38" rx="9" ry="7" fill={fill("shoulder-l", active)} />
          <ellipse id="shoulder-r" cx="59" cy="38" rx="9" ry="7" fill={fill("shoulder-r", active)} />
          {/* Lats */}
          <ellipse id="lats-l" cx="29" cy="56" rx="9" ry="14" fill={fill("lats-l", active)} />
          <ellipse id="lats-r" cx="51" cy="56" rx="9" ry="14" fill={fill("lats-r", active)} />
          {/* Triceps */}
          <rect id="tricep-l" x="10" y="44" width="8" height="20" rx="4" fill={fill("tricep-l", active)} />
          <rect id="tricep-r" x="62" y="44" width="8" height="20" rx="4" fill={fill("tricep-r", active)} />
          {/* Lower back */}
          <rect id="lower-back" x="33" y="68" width="14" height="12" rx="3" fill={fill("lower-back", active)} />
          {/* Glutes */}
          <ellipse id="glute-l" cx="32" cy="88" rx="12" ry="10" fill={fill("glute-l", active)} />
          <ellipse id="glute-r" cx="48" cy="88" rx="12" ry="10" fill={fill("glute-r", active)} />
          {/* Hamstrings */}
          <rect id="hamstring-l" x="25" y="100" width="12" height="28" rx="5" fill={fill("hamstring-l", active)} />
          <rect id="hamstring-r" x="43" y="100" width="12" height="28" rx="5" fill={fill("hamstring-r", active)} />
          {/* Calves back */}
          <rect id="calf-l" x="26" y="132" width="10" height="20" rx="5" fill={fill("calf-l", active)} />
          <rect id="calf-r" x="44" y="132" width="10" height="20" rx="5" fill={fill("calf-r", active)} />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-col justify-center gap-2">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-coral-500" />
          <span className="text-xs text-zinc-300">Targeted</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-zinc-700" />
          <span className="text-xs text-zinc-500">Other</span>
        </div>
        <div className="mt-2 max-w-[120px] space-y-0.5">
          {muscles.map((m) => (
            <p key={m} className="text-xs capitalize text-coral-400">{m}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
