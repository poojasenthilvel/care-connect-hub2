import DashboardLayout from "@/components/DashboardLayout";
import SimpleChart from "@/components/SimpleChart";
import HealthScoreGauge from "@/components/HealthScoreGauge";
import { useVitals, useAppointments } from "@/hooks/useSupabaseData";
import { useMemo } from "react";

export default function PatientAnalytics() {
  const { data: vitals } = useVitals();
  const { data: appointments } = useAppointments();

  const bpData = useMemo(() =>
    (vitals || []).slice(-10).map(v => ({
      date: new Date(v.recorded_at).toLocaleDateString("en", { month: "short", day: "numeric" }),
      systolic: v.systolic || 0,
      diastolic: v.diastolic || 0,
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

  const deptVisits = useMemo(() => {
    const map: Record<string, number> = {};
    (appointments || []).forEach(a => { map[a.department] = (map[a.department] || 0) + 1; });
    return Object.entries(map).map(([dept, visits]) => ({ dept, visits }));
  }, [appointments]);

  const score = vitals?.length ? Math.min(95, 60 + vitals.length * 3) : 60;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Health Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Your health trends and insights</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            {bpData.length > 0 ? (
              <SimpleChart data={bpData} dataKey="systolic" xKey="date" title="Blood Pressure Trend (Systolic)" height={250} />
            ) : (
              <div className="bg-card rounded-xl p-8 shadow-card text-center text-muted-foreground">No BP data recorded yet</div>
            )}
          </div>
          <HealthScoreGauge score={score} />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {sugarData.length > 0 && (
            <SimpleChart data={sugarData} dataKey="level" xKey="date" title="Blood Sugar Level" color="hsl(38, 92%, 50%)" />
          )}
          {deptVisits.length > 0 && (
            <SimpleChart data={deptVisits} dataKey="visits" xKey="dept" type="bar" title="Visits by Department" />
          )}
        </div>

        {bpData.length === 0 && sugarData.length === 0 && (
          <div className="bg-card rounded-xl p-8 shadow-card text-center text-muted-foreground">
            No analytics data yet. Your health data will appear here as vitals are recorded.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
