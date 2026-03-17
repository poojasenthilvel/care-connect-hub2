import { Heart, Droplets, Activity, Thermometer } from "lucide-react";
import { motion } from "framer-motion";

const vitals = [
  { label: "Blood Pressure", value: "120/80", unit: "mmHg", icon: <Heart size={18} />, status: "normal" as const },
  { label: "Blood Sugar", value: "95", unit: "mg/dL", icon: <Droplets size={18} />, status: "normal" as const },
  { label: "Heart Rate", value: "72", unit: "bpm", icon: <Activity size={18} />, status: "normal" as const },
  { label: "Temperature", value: "98.6", unit: "°F", icon: <Thermometer size={18} />, status: "normal" as const },
];

const statusColors = {
  normal: "text-success",
  warning: "text-warning",
  critical: "text-destructive",
};

export default function VitalsGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {vitals.map((v, i) => (
        <motion.div
          key={v.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-card rounded-xl p-4 shadow-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className={statusColors[v.status]}>{v.icon}</span>
            <span className="text-xs text-muted-foreground">{v.label}</span>
          </div>
          <p className="text-xl font-semibold font-mono tabular-nums text-foreground">
            {v.value}
            <span className="text-xs text-muted-foreground ml-1 font-sans">{v.unit}</span>
          </p>
        </motion.div>
      ))}
    </div>
  );
}
