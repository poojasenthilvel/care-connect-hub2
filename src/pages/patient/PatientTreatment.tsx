import DashboardLayout from "@/components/DashboardLayout";
import { useTreatments } from "@/hooks/useSupabaseData";

export default function PatientTreatment() {
  const { data: treatments, isLoading } = useTreatments();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Treatment History</h1>
          <p className="text-sm text-muted-foreground mt-1">Complete treatment records</p>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (treatments || []).length === 0 ? (
          <div className="bg-card rounded-xl p-8 shadow-card text-center text-muted-foreground">
            No treatment records yet
          </div>
        ) : (
          <div className="space-y-4">
            {(treatments || []).map((t) => (
              <div key={t.id} className="bg-card rounded-xl p-5 shadow-card hover:shadow-hover transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-foreground">{t.diagnosis}</p>
                    <p className="text-sm text-muted-foreground">
                      {(t as any).doctor?.full_name || "Doctor"} • {t.department || "—"}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                    t.status === "ongoing" ? "bg-primary/10 text-primary" : "bg-success/10 text-success"
                  }`}>{t.status === "ongoing" ? "Ongoing" : "Completed"}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(t.medicines || []).map((m, j) => (
                    <span key={j} className="text-xs px-2 py-1 rounded-md bg-accent text-accent-foreground font-mono">{m}</span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {new Date(t.start_date).toLocaleDateString()} — {t.end_date ? new Date(t.end_date).toLocaleDateString() : "Ongoing"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
