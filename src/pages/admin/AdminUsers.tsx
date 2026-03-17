import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { useAllProfiles } from "@/hooks/useSupabaseData";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const { data: profiles, isLoading } = useAllProfiles();

  const filtered = (profiles || []).filter((u: any) =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage patients and doctors</p>
        </div>

        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted-foreground font-medium">User</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Role</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Phone</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="p-4 text-muted-foreground">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={4} className="p-4 text-muted-foreground">No users found</td></tr>
                ) : filtered.map((u: any) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="text-foreground font-medium">{u.full_name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                        u.user_roles?.[0]?.role === "doctor" ? "bg-primary/10 text-primary" :
                        u.user_roles?.[0]?.role === "admin" ? "bg-warning/10 text-warning" :
                        "bg-success/10 text-success"
                      }`}>{u.user_roles?.[0]?.role || "patient"}</span>
                    </td>
                    <td className="p-4 text-muted-foreground">{u.phone || "—"}</td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
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
