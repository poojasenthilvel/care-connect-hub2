import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Download } from "lucide-react";
import { useState } from "react";
import { useCreatePrescription, useAllProfiles, usePrescriptions } from "@/hooks/useSupabaseData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Medicine {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
}

export default function DoctorPrescriptions() {
  const [patientId, setPatientId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([
    { id: 1, name: "", dosage: "", frequency: "", instructions: "" },
  ]);

  const { data: patients } = useAllProfiles("patient");
  const { data: prescriptions } = usePrescriptions();
  const createRx = useCreatePrescription();

  const addMedicine = () => {
    setMedicines([...medicines, { id: Date.now(), name: "", dosage: "", frequency: "", instructions: "" }]);
  };

  const removeMedicine = (id: number) => {
    if (medicines.length > 1) setMedicines(medicines.filter(m => m.id !== id));
  };

  const updateMedicine = (id: number, field: keyof Medicine, value: string) => {
    setMedicines(medicines.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSave = () => {
    if (!patientId || !diagnosis) {
      toast.error("Please select a patient and enter diagnosis");
      return;
    }
    createRx.mutate({
      patient_id: patientId,
      diagnosis,
      medicines: medicines.filter(m => m.name),
    }, {
      onSuccess: () => {
        setPatientId("");
        setDiagnosis("");
        setMedicines([{ id: 1, name: "", dosage: "", frequency: "", instructions: "" }]);
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Prescription Generator</h1>
          <p className="text-sm text-muted-foreground mt-1">Create digital prescriptions</p>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-card space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Patient</label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>
                  {(patients || []).map((p: any) => (
                    <SelectItem key={p.user_id} value={p.user_id}>{p.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Diagnosis</label>
              <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Enter diagnosis" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">Medicines</h3>
              <Button variant="outline" size="sm" onClick={addMedicine} className="gap-1">
                <Plus size={14} /> Add Medicine
              </Button>
            </div>
            <div className="space-y-3">
              {medicines.map((m) => (
                <div key={m.id} className="grid grid-cols-[1fr_auto_auto_1fr_auto] gap-3 items-end bg-accent/50 p-4 rounded-lg">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Medicine</label>
                    <Input value={m.name} onChange={(e) => updateMedicine(m.id, "name", e.target.value)} placeholder="Medicine name" className="bg-card" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Dosage</label>
                    <Input value={m.dosage} onChange={(e) => updateMedicine(m.id, "dosage", e.target.value)} placeholder="e.g. 5mg" className="bg-card w-24" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Frequency</label>
                    <Input value={m.frequency} onChange={(e) => updateMedicine(m.id, "frequency", e.target.value)} placeholder="e.g. 1-0-1" className="bg-card w-24" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Instructions</label>
                    <Input value={m.instructions} onChange={(e) => updateMedicine(m.id, "instructions", e.target.value)} placeholder="After meals" className="bg-card" />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeMedicine(m.id)} className="h-9 w-9 p-0 text-destructive">
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button className="gap-2" onClick={handleSave} disabled={createRx.isPending}>
              {createRx.isPending ? "Saving..." : "Save Prescription"}
            </Button>
          </div>
        </div>

        {/* Recent prescriptions */}
        {(prescriptions || []).length > 0 && (
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <div className="p-5 border-b border-border">
              <h2 className="text-sm font-medium text-foreground">Recent Prescriptions</h2>
            </div>
            <div className="divide-y divide-border">
              {(prescriptions || []).slice(0, 5).map(rx => (
                <div key={rx.id} className="p-4">
                  <div className="flex justify-between mb-1">
                    <p className="text-sm font-medium text-foreground">{rx.diagnosis}</p>
                    <span className="text-xs text-muted-foreground font-mono">{new Date(rx.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Patient: {(rx as any).patient?.full_name || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
