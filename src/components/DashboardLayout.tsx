import { ReactNode, useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Calendar, FileText, CreditCard, BarChart3,
  Clock, User, LogOut, Menu, X, Stethoscope, Users, Settings,
  Bell, ClipboardList, Activity, Heart, Shield
} from "lucide-react";
import { useNotifications } from "@/hooks/useSupabaseData";

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

const navItems: Record<UserRole, NavItem[]> = {
  patient: [
    { label: "Dashboard", path: "/patient", icon: <LayoutDashboard size={18} /> },
    { label: "Appointments", path: "/patient/appointments", icon: <Calendar size={18} /> },
    { label: "Reports", path: "/patient/reports", icon: <FileText size={18} /> },
    { label: "Billing", path: "/patient/billing", icon: <CreditCard size={18} /> },
    { label: "Analytics", path: "/patient/analytics", icon: <BarChart3 size={18} /> },
    { label: "Treatment", path: "/patient/treatment", icon: <Clock size={18} /> },
    { label: "Profile", path: "/patient/profile", icon: <User size={18} /> },
  ],
  doctor: [
    { label: "Dashboard", path: "/doctor", icon: <LayoutDashboard size={18} /> },
    { label: "Appointments", path: "/doctor/appointments", icon: <Calendar size={18} /> },
    { label: "Patients", path: "/doctor/patients", icon: <Users size={18} /> },
    { label: "Prescriptions", path: "/doctor/prescriptions", icon: <ClipboardList size={18} /> },
    { label: "Monitoring", path: "/doctor/monitoring", icon: <Activity size={18} /> },
    { label: "Schedule", path: "/doctor/schedule", icon: <Clock size={18} /> },
    { label: "Notifications", path: "/doctor/notifications", icon: <Bell size={18} /> },
  ],
  admin: [
    { label: "Dashboard", path: "/admin", icon: <LayoutDashboard size={18} /> },
    { label: "Users", path: "/admin/users", icon: <Users size={18} /> },
    { label: "Appointments", path: "/admin/appointments", icon: <Calendar size={18} /> },
    { label: "Reports", path: "/admin/reports", icon: <FileText size={18} /> },
    { label: "Billing", path: "/admin/billing", icon: <CreditCard size={18} /> },
    { label: "Analytics", path: "/admin/analytics", icon: <BarChart3 size={18} /> },
    { label: "Settings", path: "/admin/settings", icon: <Settings size={18} /> },
  ],
};

const roleIcons: Record<UserRole, ReactNode> = {
  patient: <Heart size={20} />,
  doctor: <Stethoscope size={20} />,
  admin: <Shield size={20} />,
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: notifications } = useNotifications();
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  if (!user) return null;

  const items = navItems[user.role];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-background">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card shadow-elevated flex flex-col transition-transform duration-200 ease-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center gap-3 px-5 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Heart size={16} className="text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground tracking-tight">MedFlow</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {roleIcons[user.role]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {items.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 mb-0.5 ${
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center gap-4 px-4 lg:px-8 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground">
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <button
            onClick={() => navigate(user.role === "doctor" ? "/doctor/notifications" : "#")}
            className="relative p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            )}
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
