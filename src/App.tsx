import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import LoginPage from "./pages/LoginPage";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientReports from "./pages/patient/PatientReports";
import PatientBilling from "./pages/patient/PatientBilling";
import PatientAnalytics from "./pages/patient/PatientAnalytics";
import PatientTreatment from "./pages/patient/PatientTreatment";
import PatientProfile from "./pages/patient/PatientProfile";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorPrescriptions from "./pages/doctor/DoctorPrescriptions";
import DoctorMonitoring from "./pages/doctor/DoctorMonitoring";
import DoctorSchedule from "./pages/doctor/DoctorSchedule";
import DoctorNotifications from "./pages/doctor/DoctorNotifications";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminReports from "./pages/admin/AdminReports";
import AdminBilling from "./pages/admin/AdminBilling";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import CallPage from "./pages/CallPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, role }: { children: React.ReactNode; role: string }) {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== role) return <Navigate to={`/${user?.role}`} replace />;
  return <>{children}</>;
}

function AuthRedirect() {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  if (isAuthenticated && user) return <Navigate to={`/${user.role}`} replace />;
  return <LoginPage />;
}

function AnyProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<AuthRedirect />} />
            <Route path="/call/:appointmentId" element={<AnyProtectedRoute><CallPage /></AnyProtectedRoute>} />

            {/* Patient Routes */}
            <Route path="/patient" element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />
            <Route path="/patient/appointments" element={<ProtectedRoute role="patient"><PatientAppointments /></ProtectedRoute>} />
            <Route path="/patient/reports" element={<ProtectedRoute role="patient"><PatientReports /></ProtectedRoute>} />
            <Route path="/patient/billing" element={<ProtectedRoute role="patient"><PatientBilling /></ProtectedRoute>} />
            <Route path="/patient/analytics" element={<ProtectedRoute role="patient"><PatientAnalytics /></ProtectedRoute>} />
            <Route path="/patient/treatment" element={<ProtectedRoute role="patient"><PatientTreatment /></ProtectedRoute>} />
            <Route path="/patient/profile" element={<ProtectedRoute role="patient"><PatientProfile /></ProtectedRoute>} />

            {/* Doctor Routes */}
            <Route path="/doctor" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/appointments" element={<ProtectedRoute role="doctor"><DoctorAppointments /></ProtectedRoute>} />
            <Route path="/doctor/patients" element={<ProtectedRoute role="doctor"><DoctorPatients /></ProtectedRoute>} />
            <Route path="/doctor/prescriptions" element={<ProtectedRoute role="doctor"><DoctorPrescriptions /></ProtectedRoute>} />
            <Route path="/doctor/monitoring" element={<ProtectedRoute role="doctor"><DoctorMonitoring /></ProtectedRoute>} />
            <Route path="/doctor/schedule" element={<ProtectedRoute role="doctor"><DoctorSchedule /></ProtectedRoute>} />
            <Route path="/doctor/notifications" element={<ProtectedRoute role="doctor"><DoctorNotifications /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/appointments" element={<ProtectedRoute role="admin"><AdminAppointments /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute role="admin"><AdminReports /></ProtectedRoute>} />
            <Route path="/admin/billing" element={<ProtectedRoute role="admin"><AdminBilling /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute role="admin"><AdminSettings /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
