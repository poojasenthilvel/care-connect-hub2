import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export default function StatCard({ label, value, icon, trend, className = "" }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card rounded-xl p-5 shadow-card hover:shadow-hover transition-shadow duration-200 ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-semibold text-foreground font-mono tabular-nums">{value}</p>
      {trend && (
        <p className={`text-xs mt-1 font-medium ${trend.positive ? "text-success" : "text-destructive"}`}>
          {trend.positive ? "↑" : "↓"} {trend.value}
        </p>
      )}
    </motion.div>
  );
}
