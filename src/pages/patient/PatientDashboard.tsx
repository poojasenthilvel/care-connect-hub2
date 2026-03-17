import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import VitalsGrid from "@/components/VitalsGrid";
import HealthScoreGauge from "@/components/HealthScoreGauge";
import AppointmentCard from "@/components/AppointmentCard";
import SimpleChart from "@/components/SimpleChart";
import { Calendar, FileText, CreditCard, Activity } from "lucide-react";
import { useAppointments, useBills, useMedicalReports, useVitals } from "@/hooks/useSupabaseData";
import { useMemo } from "react";

export default function PatientDashboard() {
  const { user } = useAuth();
  const { data: appointments } = useAppointments();
  const { data: bills } = useBills();
  const { data: reports } = useMedicalReports();
  const { data: vitals } = useVitals();

  const upcoming = useMemo(() =>
    (appointments || []).filter(a => a.status !== "completed" && a.status !== "cancelled").slice(0, 2),
    [appointments]
  );

  const totalDue = useMemo(() =>
    (bills || []).filter(b => b.status === "unpaid").reduce((s, b) => s + Number(b.amount), 0),
    [bills]
  );

  const bpData = useMemo(() =>
    (vitals || []).slice(-6).map((v, i) => ({ month: new Date(v.recorded_at).toLocaleDateString("en", { month: "short", day: "numeric" }), systolic: v.systolic || 0 })),
    [vitals]
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome back, {user?.name?.split(" ")[0] || "Patient"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Here's your health overview</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Appointments" value={appointments?.length || 0} icon={<Calendar size={18} />} trend={{ value: `${upcoming.length} upcoming`, positive: true }} />
          <StatCard label="Reports" value={reports?.length || 0} icon={<FileText size={18} />} />
          <StatCard label="Bills Due" value={`$${totalDue.toFixed(0)}`} icon={<CreditCard size={18} />} />
          <StatCard label="Vitals Recorded" value={vitals?.length || 0} icon={<Activity size={18} />} />
        </div>

        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Current Vitals</h2>
          <VitalsGrid />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <HealthScoreGauge score={vitals?.length ? Math.min(95, 60 + vitals.length * 3) : 60} />
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">Upcoming Appointments</h2>
            {upcoming.length === 0 && (
              <p className="text-sm text-muted-foreground bg-card rounded-xl p-4 shadow-card">No upcoming appointments</p>
            )}
            {upcoming.map((a) => (
              <AppointmentCard
                key={a.id}
                appointmentId={a.id}
                doctor={(a as any).doctor?.full_name || "Doctor"}
                specialty={a.department}
                date={new Date(a.appointment_date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                time={a.appointment_time}
                type={a.type as "in-person" | "telemedicine"}
                status="upcoming"
              />
            ))}
          </div>
        </div>

        {bpData.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-4">
            <SimpleChart data={bpData} dataKey="systolic" xKey="month" title="Blood Pressure Trend (Systolic)" />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
