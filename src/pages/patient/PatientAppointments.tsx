import DashboardLayout from "@/components/DashboardLayout";
import AppointmentCard from "@/components/AppointmentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAppointments, useCreateAppointment, useDepartments, useUpdateAppointment } from "@/hooks/useSupabaseData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PatientAppointments() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [dept, setDept] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [type, setType] = useState("in-person");

  const { data: appointments, isLoading } = useAppointments();
  const { data: departments } = useDepartments();
  const createAppt = useCreateAppointment();
  const updateAppt = useUpdateAppointment();

  const filtered = (appointments || []).filter(a =>
    ((a as any).doctor?.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    a.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleBook = () => {
    if (!dept || !date || !time) return;
    createAppt.mutate(
      { department: dept, appointment_date: date, appointment_time: time, reason, type },
      { onSuccess: () => { setOpen(false); setDept(""); setDate(""); setTime(""); setReason(""); } }
    );
  };

  const handleCancel = (id: string) => {
    updateAppt.mutate({ id, status: "cancelled" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Appointments</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your appointments</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus size={16} /> Book Appointment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Book New Appointment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Department</label>
                  <Select value={dept} onValueChange={setDept}>
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {(departments || []).map(d => (
                        <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Date</label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Time</label>
                  <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Type</label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-person">In-Person</SelectItem>
                      <SelectItem value="telemedicine">Telemedicine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Reason</label>
                  <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Brief description" />
                </div>
                <Button className="w-full" onClick={handleBook} disabled={createAppt.isPending}>
                  {createAppt.isPending ? "Booking..." : "Confirm Booking"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search appointments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm">No appointments found. Book your first one!</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((a) => (
              <div key={a.id} className="relative">
                <AppointmentCard
                  appointmentId={a.id}
                  doctor={(a as any).doctor?.full_name || "Unassigned"}
                  specialty={a.department}
                  date={new Date(a.appointment_date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                  time={a.appointment_time}
                  type={a.type as "in-person" | "telemedicine"}
                  status={a.status === "completed" ? "completed" : a.status === "cancelled" ? "cancelled" : "upcoming"}
                />
                {a.status !== "completed" && a.status !== "cancelled" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 text-destructive text-xs"
                    onClick={() => handleCancel(a.id)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
