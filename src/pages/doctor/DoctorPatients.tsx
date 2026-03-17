import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Eye, FileText } from "lucide-react";
import { useState } from "react";
import { useAllProfiles } from "@/hooks/useSupabaseData";

export default function DoctorPatients() {
  const [search, setSearch] = useState("");
  const { data: profiles, isLoading } = useAllProfiles("patient");

  const filtered = (profiles || []).filter((p: any) =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Patient Records</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage patient information</p>
        </div>

        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted-foreground font-medium">Patient</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Email</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Phone</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Blood Type</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="p-4 text-muted-foreground">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={4} className="p-4 text-muted-foreground">No patients found</td></tr>
                ) : filtered.map((p: any) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                          {p.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="text-foreground font-medium">{p.full_name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{p.email}</td>
                    <td className="p-4 text-muted-foreground">{p.phone || "—"}</td>
                    <td className="p-4 text-muted-foreground">{p.blood_type || "—"}</td>
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
