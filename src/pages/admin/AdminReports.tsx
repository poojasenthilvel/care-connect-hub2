import DashboardLayout from "@/components/DashboardLayout";
import { FileText, Database } from "lucide-react";
import StatCard from "@/components/StatCard";
import { useMedicalReports } from "@/hooks/useSupabaseData";

export default function AdminReports() {
  const { data: reports } = useMedicalReports();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reports Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Medical records and data management</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Total Records" value={reports?.length || 0} icon={<FileText size={18} />} />
          <StatCard label="This Month" value={(reports || []).filter(r => new Date(r.created_at).getMonth() === new Date().getMonth()).length} icon={<Database size={18} />} />
        </div>

        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="text-sm font-medium text-foreground">All Reports</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted-foreground font-medium">Report</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Type</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {(reports || []).length === 0 ? (
                  <tr><td colSpan={3} className="p-4 text-muted-foreground">No reports</td></tr>
                ) : (reports || []).map(r => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="p-4 text-foreground font-medium">{r.name}</td>
                    <td className="p-4 text-muted-foreground">{r.type}</td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
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
