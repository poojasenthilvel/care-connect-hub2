import DashboardLayout from "@/components/DashboardLayout";
import { AlertTriangle, Clock, UserCheck, Bell } from "lucide-react";
import { useNotifications, useMarkNotificationRead } from "@/hooks/useSupabaseData";

const typeStyles: Record<string, string> = {
  emergency: "bg-destructive/10 text-destructive",
  followup: "bg-warning/10 text-warning",
  appointment: "bg-primary/10 text-primary",
  general: "bg-accent text-muted-foreground",
};

const typeIcons: Record<string, React.ReactNode> = {
  emergency: <AlertTriangle size={16} />,
  followup: <Clock size={16} />,
  appointment: <UserCheck size={16} />,
  general: <Bell size={16} />,
};

export default function DoctorNotifications() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">{notifications?.length || 0} notifications</p>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (notifications || []).length === 0 ? (
          <div className="bg-card rounded-xl p-8 shadow-card text-center text-muted-foreground">
            No notifications
          </div>
        ) : (
          <div className="space-y-3">
            {(notifications || []).map((n) => (
              <div
                key={n.id}
                className={`bg-card rounded-xl p-4 shadow-card hover:shadow-hover transition-shadow flex items-start gap-3 cursor-pointer ${!n.read ? "ring-1 ring-primary/20" : ""}`}
                onClick={() => !n.read && markRead.mutate(n.id)}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${typeStyles[n.type] || typeStyles.general}`}>
                  {typeIcons[n.type] || typeIcons.general}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(n.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
