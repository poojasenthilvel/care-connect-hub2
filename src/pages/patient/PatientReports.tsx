import DashboardLayout from "@/components/DashboardLayout";
import { FileText, Download, Upload, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMedicalReports, useUploadMedicalReport } from "@/hooks/useSupabaseData";
import { useRef } from "react";
import { toast } from "sonner";

export default function PatientReports() {
  const { data: reports, isLoading } = useMedicalReports();
  const uploadReport = useUploadMedicalReport();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadReport.mutate(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Medical Reports</h1>
            <p className="text-sm text-muted-foreground mt-1">View and manage your reports</p>
          </div>
          <div>
            <input type="file" ref={fileRef} className="hidden" onChange={handleUpload} accept=".pdf,.jpg,.png,.doc,.docx" />
            <Button variant="outline" className="gap-2" onClick={() => fileRef.current?.click()}>
              <Upload size={16} /> Upload Report
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted-foreground font-medium">Report</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Type</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Doctor</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Date</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="p-4 text-muted-foreground">Loading...</td></tr>
                ) : (reports || []).length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-muted-foreground">No reports yet</td></tr>
                ) : (reports || []).map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <FileText size={14} />
                        </div>
                        <span className="text-foreground font-medium">{r.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{r.type}</td>
                    <td className="p-4 text-muted-foreground">{(r as any).doctor?.full_name || "—"}</td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {r.file_url ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => window.open(r.file_url!.startsWith("http") ? r.file_url! : `${import.meta.env.VITE_API_URL || "http://localhost:8787"}${r.file_url!}`, "_blank")}
                            >
                              <Eye size={14} />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                              <a href={r.file_url.startsWith("http") ? r.file_url : `${import.meta.env.VITE_API_URL || "http://localhost:8787"}${r.file_url}`} download>
                                <Download size={14} />
                              </a>
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">No file</span>
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
