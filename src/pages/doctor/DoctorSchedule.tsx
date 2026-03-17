import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useDoctorSchedule, useUpsertSchedule } from "@/hooks/useSupabaseData";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

export default function DoctorSchedule() {
  const { data: schedule } = useDoctorSchedule();
  const upsertSchedule = useUpsertSchedule();

  const [availability, setAvailability] = useState<Record<string, string[]>>({
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [],
  });

  useEffect(() => {
    if (schedule) {
      const map: Record<string, string[]> = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [] };
      schedule.forEach(s => { map[s.day_of_week] = s.time_slots || []; });
      setAvailability(map);
    }
  }, [schedule]);

  const toggleSlot = (day: string, slot: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: prev[day].includes(slot)
        ? prev[day].filter(s => s !== slot)
        : [...prev[day], slot],
    }));
  };

  const handleSave = () => {
    const schedules = Object.entries(availability).map(([day_of_week, time_slots]) => ({
      day_of_week,
      time_slots,
    }));
    upsertSchedule.mutate(schedules);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">My Schedule</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your availability</p>
          </div>
          <Button onClick={handleSave} disabled={upsertSchedule.isPending}>
            {upsertSchedule.isPending ? "Saving..." : "Save Schedule"}
          </Button>
        </div>

        <div className="bg-card rounded-xl shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-muted-foreground font-medium w-24">Time</th>
                {days.map(d => (
                  <th key={d} className="text-center p-4 text-muted-foreground font-medium">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(slot => (
                <tr key={slot} className="border-b border-border last:border-0">
                  <td className="p-4 font-mono text-xs text-muted-foreground">{slot}</td>
                  {days.map(day => {
                    const active = availability[day]?.includes(slot);
                    return (
                      <td key={day} className="p-2 text-center">
                        <button
                          onClick={() => toggleSlot(day, slot)}
                          className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${
                            active
                              ? "bg-success/10 text-success"
                              : "bg-accent text-muted-foreground hover:bg-accent/80"
                          }`}
                        >
                          {active ? "Available" : "—"}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
