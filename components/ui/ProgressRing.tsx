type ProgressRingProps = {
  value: number;
};

export function ProgressRing({ value }: ProgressRingProps) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative size-28">
      <svg className="size-28 -rotate-90" viewBox="0 0 120 120" aria-label="Progress">
        <circle cx="60" cy="60" r={radius} className="fill-none stroke-zinc-800" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            fill: "none",
            stroke: "url(#ringGradient)",
            transition: "stroke-dashoffset 0.6s ease",
          }}
        />
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </svg>
      <p className="absolute inset-0 grid place-content-center text-sm font-bold text-white">{value}%</p>
    </div>
  );
}
