import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import AppointmentCard from "@/components/AppointmentCard";
import SimpleChart from "@/components/SimpleChart";
import { Calendar, Users, ClipboardList, Clock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppointments, useUpdateAppointment, usePrescriptions } from "@/hooks/useSupabaseData";
import { useMemo } from "react";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { data: appointments } = useAppointments();
  const { data: prescriptions } = usePrescriptions();
  const updateAppt = useUpdateAppointment();

  const today = new Date().toISOString().split("T")[0];
  const todayAppts = useMemo(() =>
    (appointments || []).filter(a => a.appointment_date === today),
    [appointments, today]
  );

  const pending = useMemo(() =>
    (appointments || []).filter(a => a.status === "pending" || a.status === "waiting"),
    [appointments]
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Good morning, {user?.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{user?.specialization || "Doctor"}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Today's Patients" value={todayAppts.length} icon={<Calendar size={18} />} />
          <StatCard label="Total Appointments" value={appointments?.length || 0} icon={<Users size={18} />} />
          <StatCard label="Prescriptions" value={prescriptions?.length || 0} icon={<ClipboardList size={18} />} />
          <StatCard label="Pending" value={pending.length} icon={<Clock size={18} />} />
        </div>

        {/* Pending Queue */}
        {pending.length > 0 && (
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">Pending Appointments</h2>
              <span className="text-xs text-muted-foreground font-mono">{pending.length} pending</span>
            </div>
            <div className="divide-y divide-border">
              {pending.slice(0, 5).map((p) => (
                <div key={p.id} className="p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                    {((p as any).patient?.full_name || "?").split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{(p as any).patient?.full_name || "Patient"}</p>
                    <p className="text-xs text-muted-foreground">{p.reason || p.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-muted-foreground">{new Date(p.appointment_date).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">{p.appointment_time}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-success hover:bg-success/10"
                      onClick={() => updateAppt.mutate({ id: p.id, status: "waiting" })}>
                      <Check size={14} />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => updateAppt.mutate({ id: p.id, status: "cancelled" })}>
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {todayAppts.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">Today's Appointments</h2>
            {todayAppts.map(a => (
              <AppointmentCard
                key={a.id}
                appointmentId={a.id}
                patient={(a as any).patient?.full_name || "Patient"}
                date="Today"
                time={a.appointment_time}
                type={a.type as "in-person" | "telemedicine"}
                status={a.status === "completed" ? "completed" : "upcoming"}
              />
            ))}
          </div>
        )}

        {(appointments || []).length === 0 && (
          <div className="bg-card rounded-xl p-8 shadow-card text-center text-muted-foreground">
            No appointments yet
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
