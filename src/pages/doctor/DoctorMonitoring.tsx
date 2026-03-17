import DashboardLayout from "@/components/DashboardLayout";
import SimpleChart from "@/components/SimpleChart";
import { useState } from "react";
import { useAllProfiles, useVitals } from "@/hooks/useSupabaseData";
import { useMemo } from "react";

export default function DoctorMonitoring() {
  const { data: patients } = useAllProfiles("patient");
  const [selectedId, setSelectedId] = useState<string>("");

  const actualId = selectedId || (patients as any)?.[0]?.user_id || "";
  const { data: vitals } = useVitals(actualId || undefined);

  const bpData = useMemo(() =>
    (vitals || []).slice(-10).map(v => ({
      date: new Date(v.recorded_at).toLocaleDateString("en", { month: "short", day: "numeric" }),
      systolic: v.systolic || 0,
    })),
    [vitals]
  );

  const sugarData = useMemo(() =>
    (vitals || []).filter(v => v.sugar_level).slice(-10).map(v => ({
      date: new Date(v.recorded_at).toLocaleDateString("en", { month: "short", day: "numeric" }),
      level: v.sugar_level || 0,
    })),
    [vitals]
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Patient Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-1">Track patient vitals</p>
        </div>

        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="divide-y divide-border">
            {(patients || []).map((p: any) => (
              <button
                key={p.user_id}
                onClick={() => setSelectedId(p.user_id)}
                className={`w-full flex items-center gap-4 p-4 text-left transition-colors ${
                  (selectedId || (patients as any)?.[0]?.user_id) === p.user_id ? "bg-primary/5" : "hover:bg-accent/50"
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                  {p.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{p.full_name}</p>
                  <p className="text-xs text-muted-foreground">{p.email}</p>
                </div>
              </button>
            ))}
            {(patients || []).length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">No patients found</p>
            )}
          </div>
        </div>

        {actualId && (
          <div className="grid lg:grid-cols-2 gap-4">
            {bpData.length > 0 ? (
              <SimpleChart data={bpData} dataKey="systolic" xKey="date" title="BP Trend (Systolic)" />
            ) : (
              <div className="bg-card rounded-xl p-8 shadow-card text-center text-muted-foreground">No BP data</div>
            )}
            {sugarData.length > 0 ? (
              <SimpleChart data={sugarData} dataKey="level" xKey="date" title="Sugar Level" color="hsl(38, 92%, 50%)" />
            ) : (
              <div className="bg-card rounded-xl p-8 shadow-card text-center text-muted-foreground">No sugar data</div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
