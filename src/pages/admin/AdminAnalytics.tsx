import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Users, Stethoscope, Calendar, Building2 } from "lucide-react";
import { useAdminStats, useDepartments } from "@/hooks/useSupabaseData";

export default function AdminAnalytics() {
  const { data: stats } = useAdminStats();
  const { data: departments } = useDepartments();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Hospital-wide performance metrics</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Patients" value={stats?.totalPatients || 0} icon={<Users size={18} />} />
          <StatCard label="Active Doctors" value={stats?.totalDoctors || 0} icon={<Stethoscope size={18} />} />
          <StatCard label="Appointments" value={stats?.totalAppointments || 0} icon={<Calendar size={18} />} />
          <StatCard label="Departments" value={departments?.length || 0} icon={<Building2 size={18} />} />
        </div>

        <div className="bg-card rounded-xl p-8 shadow-card text-center text-muted-foreground">
          Charts will populate as data grows. Register users and create appointments to see analytics.
        </div>
      </div>
    </DashboardLayout>
  );
}
