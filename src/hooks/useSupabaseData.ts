import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

// ==================== APPOINTMENTS ====================
export function useAppointments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["appointments", user?.id],
    queryFn: async () => {
      return await apiRequest<any[]>("/api/appointments");
    },
    enabled: !!user,
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (appt: { department: string; appointment_date: string; appointment_time: string; reason: string; type: string; doctor_id?: string }) => {
      await apiRequest("/api/appointments", { method: "POST", body: JSON.stringify(appt) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment booked successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: string; appointment_date?: string; appointment_time?: string }) => {
      await apiRequest(`/api/appointments/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ==================== PROFILES ====================
export function useProfile(userId?: string) {
  const { user } = useAuth();
  const uid = userId || user?.id;
  return useQuery({
    queryKey: ["profile", uid],
    queryFn: async () => {
      if (uid && uid !== user?.id) {
        // minimal support for admin/doctor listing is via /api/profiles
        const all = await apiRequest<any[]>(`/api/profiles`);
        const found = all.find((p) => p.user_id === uid);
        if (!found) throw new Error("Profile not found");
        return found;
      }
      return await apiRequest<any>("/api/profiles/me");
    },
    enabled: !!uid,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      await apiRequest("/api/profiles/me", { method: "PATCH", body: JSON.stringify(updates) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAllProfiles(role?: string) {
  return useQuery({
    queryKey: ["profiles", role],
    queryFn: async () => {
      const qs = role ? `?role=${encodeURIComponent(role)}` : "";
      return await apiRequest<any[]>(`/api/profiles${qs}`);
    },
  });
}

// ==================== MEDICAL REPORTS ====================
export function useMedicalReports() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["medical_reports", user?.id],
    queryFn: async () => {
      return await apiRequest<any[]>("/api/medical_reports");
    },
    enabled: !!user,
  });
}

export function useCreateMedicalReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (report: { name: string; type: string; file_url?: string }) => {
      await apiRequest("/api/medical_reports", { method: "POST", body: JSON.stringify(report) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medical_reports"] });
      toast.success("Report uploaded");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUploadMedicalReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", file.name);
      fd.append("type", file.type.includes("pdf") ? "Lab Report" : "Diagnostic");
      return await apiRequest<{ id: string; file_url: string }>("/api/medical_reports/upload", {
        method: "POST",
        body: fd,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medical_reports"] });
      toast.success("Report uploaded");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ==================== BILLS ====================
export function useBills() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bills", user?.id],
    queryFn: async () => {
      return await apiRequest<any[]>("/api/bills");
    },
    enabled: !!user,
  });
}

export function usePayBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (billId: string) => {
      await apiRequest(`/api/bills/${billId}/pay`, { method: "PATCH" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bills"] });
      toast.success("Bill paid successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ==================== PRESCRIPTIONS ====================
export function usePrescriptions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["prescriptions", user?.id],
    queryFn: async () => {
      return await apiRequest<any[]>("/api/prescriptions");
    },
    enabled: !!user,
  });
}

export function useCreatePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rx: { patient_id: string; diagnosis: string; medicines: any[] }) => {
      await apiRequest("/api/prescriptions", { method: "POST", body: JSON.stringify(rx) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prescriptions"] });
      toast.success("Prescription created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ==================== TREATMENTS ====================
export function useTreatments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["treatments", user?.id],
    queryFn: async () => {
      return await apiRequest<any[]>("/api/treatments");
    },
    enabled: !!user,
  });
}

// ==================== VITALS ====================
export function useVitals(patientId?: string) {
  const { user } = useAuth();
  const uid = patientId || user?.id;
  return useQuery({
    queryKey: ["vitals", uid],
    queryFn: async () => {
      const qs = patientId ? `?patientId=${encodeURIComponent(patientId)}` : "";
      return await apiRequest<any[]>(`/api/vitals${qs}`);
    },
    enabled: !!uid,
  });
}

// ==================== DOCTOR SCHEDULES ====================
export function useDoctorSchedule(doctorId?: string) {
  const { user } = useAuth();
  const uid = doctorId || user?.id;
  return useQuery({
    queryKey: ["doctor_schedule", uid],
    queryFn: async () => {
      const qs = uid ? `?doctorId=${encodeURIComponent(uid)}` : "";
      return await apiRequest<any[]>(`/api/doctor_schedules${qs}`);
    },
    enabled: !!uid,
  });
}

export function useUpsertSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (schedules: { day_of_week: string; time_slots: string[] }[]) => {
      await apiRequest("/api/doctor_schedules/upsert", { method: "POST", body: JSON.stringify({ schedules }) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor_schedule"] });
      toast.success("Schedule saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ==================== NOTIFICATIONS ====================
export function useNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      return await apiRequest<any[]>("/api/notifications");
    },
    enabled: !!user,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/notifications/${id}/read`, { method: "PATCH" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

// ==================== DEPARTMENTS ====================
export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      return await apiRequest<any[]>("/api/departments");
    },
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      await apiRequest("/api/departments", { method: "POST", body: JSON.stringify({ name }) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department added");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ==================== ANNOUNCEMENTS ====================
export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      return await apiRequest<any[]>("/api/announcements");
    },
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ann: { title: string; message: string }) => {
      await apiRequest("/api/announcements", { method: "POST", body: JSON.stringify(ann) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement published");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ==================== ADMIN STATS ====================
export function useAdminStats() {
  return useQuery({
    queryKey: ["admin_stats"],
    queryFn: async () => {
      return await apiRequest<{ totalPatients: number; totalDoctors: number; totalAppointments: number; totalRevenue: number }>(
        "/api/admin/stats"
      );
    },
  });
}
