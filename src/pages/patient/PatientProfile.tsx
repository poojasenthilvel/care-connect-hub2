import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useProfile, useUpdateProfile } from "@/hooks/useSupabaseData";
import { useState, useEffect } from "react";

export default function PatientProfile() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    address: "",
    blood_type: "",
    allergies: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        date_of_birth: profile.date_of_birth || "",
        address: profile.address || "",
        blood_type: profile.blood_type || "",
        allergies: profile.allergies || "",
        emergency_contact_name: profile.emergency_contact_name || "",
        emergency_contact_phone: profile.emergency_contact_phone || "",
      });
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile.mutate(form);
  };

  if (isLoading) return <DashboardLayout><p className="text-muted-foreground">Loading...</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your personal information</p>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <User size={28} />
            </div>
            <div>
              <p className="font-semibold text-foreground text-lg">{form.full_name || user?.name}</p>
              <p className="text-sm text-muted-foreground">{form.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                <Input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <Input value={form.email} disabled />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Phone</label>
                <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Date of Birth</label>
                <Input type="date" value={form.date_of_birth} onChange={e => setForm(p => ({ ...p, date_of_birth: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Address</label>
              <Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="123 Main Street" />
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-medium text-foreground mb-3">Emergency Contact</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input value={form.emergency_contact_name} onChange={e => setForm(p => ({ ...p, emergency_contact_name: e.target.value }))} placeholder="Contact Name" />
                <Input value={form.emergency_contact_phone} onChange={e => setForm(p => ({ ...p, emergency_contact_phone: e.target.value }))} placeholder="Contact Phone" />
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-medium text-foreground mb-3">Medical Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Blood Type</label>
                  <Input value={form.blood_type} onChange={e => setForm(p => ({ ...p, blood_type: e.target.value }))} placeholder="e.g. O+" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Allergies</label>
                  <Input value={form.allergies} onChange={e => setForm(p => ({ ...p, allergies: e.target.value }))} placeholder="e.g. Penicillin, Peanuts" />
                </div>
              </div>
            </div>

            <Button className="mt-2" onClick={handleSave} disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
