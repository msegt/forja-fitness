type ProgressRingProps = {
  value: number;
};

export function ProgressRing({ value }: ProgressRingProps) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative size-28">
      <svg className="size-28 -rotate-90" viewBox="0 0 120 120" aria-label="Weekly progress">
        <circle cx="60" cy="60" r={radius} className="fill-none stroke-slate-700" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          className="fill-none stroke-orange-400"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <p className="absolute inset-0 grid place-content-center text-sm font-semibold text-slate-100">{value}%</p>
    </div>
  );
}
