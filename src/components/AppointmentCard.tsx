import { Calendar, Clock, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AppointmentCardProps {
  appointmentId?: string;
  doctor?: string;
  patient?: string;
  specialty?: string;
  date: string;
  time: string;
  type: "in-person" | "telemedicine";
  status: "upcoming" | "completed" | "cancelled";
}

export default function AppointmentCard({ appointmentId, doctor, patient, specialty, date, time, type, status }: AppointmentCardProps) {
  const navigate = useNavigate();
  return (
    <div className="bg-card rounded-xl p-4 shadow-card hover:shadow-hover transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium text-sm text-foreground">{doctor || patient}</p>
          {specialty && <p className="text-xs text-muted-foreground">{specialty}</p>}
        </div>
        <span className={`text-xs px-2 py-1 rounded-md font-medium ${
          status === "upcoming" ? "bg-primary/10 text-primary" :
          status === "completed" ? "bg-success/10 text-success" :
          "bg-destructive/10 text-destructive"
        }`}>
          {status}
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Calendar size={12} /> {date}</span>
        <span className="flex items-center gap-1"><Clock size={12} /> {time}</span>
      </div>
      {status === "upcoming" && type === "telemedicine" && (
        <Button
          size="sm"
          className="mt-3 w-full gap-2 text-xs"
          onClick={() => {
            const id = appointmentId || `${date}_${time}`;
            navigate(`/call/${encodeURIComponent(id)}`);
          }}
        >
          <Video size={14} /> Join Telemedicine
        </Button>
      )}
    </div>
  );
}
