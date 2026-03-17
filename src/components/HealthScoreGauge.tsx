import { motion } from "framer-motion";

interface HealthScoreGaugeProps {
  score: number;
}

export default function HealthScoreGauge({ score }: HealthScoreGaugeProps) {
  const circumference = 2 * Math.PI * 54;
  const progress = (score / 100) * circumference;
  const color = score >= 75 ? "hsl(var(--success))" : score >= 50 ? "hsl(var(--warning))" : "hsl(var(--destructive))";
  const label = score >= 75 ? "Excellent" : score >= 50 ? "Fair" : "Needs Attention";

  return (
    <div className="bg-card rounded-xl p-6 shadow-card flex flex-col items-center">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Health Score</h3>
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
          <motion.circle
            cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold font-mono tabular-nums text-foreground">{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <p className="mt-3 text-sm font-medium" style={{ color }}>{label}</p>
    </div>
  );
}
