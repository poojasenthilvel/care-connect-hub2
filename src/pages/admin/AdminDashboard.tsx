import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import SimpleChart from "@/components/SimpleChart";
import { Users, Stethoscope, Calendar, DollarSign } from "lucide-react";
import { useAdminStats, useAllProfiles, useAppointments } from "@/hooks/useSupabaseData";
import { useMemo } from "react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats } = useAdminStats();
  const { data: profiles } = useAllProfiles();
  const { data: appointments } = useAppointments();

  const recentUsers = useMemo(() => (profiles || []).slice(0, 5), [profiles]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">System overview • {user?.name}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Patients" value={stats?.totalPatients || 0} icon={<Users size={18} />} />
          <StatCard label="Total Doctors" value={stats?.totalDoctors || 0} icon={<Stethoscope size={18} />} />
          <StatCard label="Appointments" value={stats?.totalAppointments || 0} icon={<Calendar size={18} />} />
          <StatCard label="Revenue" value={`$${((stats?.totalRevenue || 0) / 1000).toFixed(0)}K`} icon={<DollarSign size={18} />} />
        </div>

        {/* Users table */}
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="text-sm font-medium text-foreground">Recent Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted-foreground font-medium">Name</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Email</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.length === 0 ? (
                  <tr><td colSpan={3} className="p-4 text-muted-foreground">No users yet</td></tr>
                ) : recentUsers.map((u: any) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                          {u.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "?"}
                        </div>
                        <span className="text-foreground font-medium">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{u.email}</td>
                    <td className="p-4">
                      <span className="text-xs px-2 py-1 rounded-md font-medium bg-primary/10 text-primary">
                        {u.user_roles?.[0]?.role || "—"}
                      </span>
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
