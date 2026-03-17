import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Check, Video, X } from "lucide-react";
import { useAppointments, useUpdateAppointment } from "@/hooks/useSupabaseData";
import { useNavigate } from "react-router-dom";

export default function AdminAppointments() {
  const { data: appointments, isLoading } = useAppointments();
  const updateAppt = useUpdateAppointment();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">All Appointments</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor and manage hospital appointments</p>
        </div>

        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted-foreground font-medium">Patient</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Department</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Date</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="p-4 text-muted-foreground">Loading...</td></tr>
                ) : (appointments || []).length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-muted-foreground">No appointments</td></tr>
                ) : (appointments || []).map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="p-4 text-foreground font-medium">{(a as any).patient?.full_name || "Patient"}</td>
                    <td className="p-4 text-muted-foreground">{a.department}</td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">
                      {new Date(a.appointment_date).toLocaleDateString()} {a.appointment_time}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                        a.status === "pending" || a.status === "waiting" ? "bg-warning/10 text-warning" :
                        a.status === "completed" ? "bg-primary/10 text-primary" :
                        "bg-destructive/10 text-destructive"
                      }`}>{a.status}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {a.type === "telemedicine" && a.status !== "completed" && a.status !== "cancelled" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-primary"
                            title="Join telemedicine call"
                            onClick={() => navigate(`/call/${encodeURIComponent(a.id)}`)}
                          >
                            <Video size={14} />
                          </Button>
                        )}

                        {a.status !== "completed" && a.status !== "cancelled" ? (
                          <>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-success"
                              onClick={() => updateAppt.mutate({ id: a.id, status: "waiting" })}>
                              <Check size={14} />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive"
                              onClick={() => updateAppt.mutate({ id: a.id, status: "cancelled" })}>
                              <X size={14} />
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
