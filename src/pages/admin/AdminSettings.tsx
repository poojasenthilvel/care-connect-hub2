import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building2, Megaphone } from "lucide-react";
import { useDepartments, useCreateDepartment, useAnnouncements, useCreateAnnouncement } from "@/hooks/useSupabaseData";
import { useState } from "react";

export default function AdminSettings() {
  const { data: departments } = useDepartments();
  const createDept = useCreateDepartment();
  const { data: announcements } = useAnnouncements();
  const createAnn = useCreateAnnouncement();

  const [newDept, setNewDept] = useState("");
  const [annTitle, setAnnTitle] = useState("");
  const [annMessage, setAnnMessage] = useState("");

  const handleAddDept = () => {
    if (!newDept.trim()) return;
    createDept.mutate(newDept.trim(), { onSuccess: () => setNewDept("") });
  };

  const handlePublish = () => {
    if (!annTitle.trim() || !annMessage.trim()) return;
    createAnn.mutate({ title: annTitle, message: annMessage }, {
      onSuccess: () => { setAnnTitle(""); setAnnMessage(""); }
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">System Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Hospital configuration</p>
        </div>

        {/* Departments */}
        <div className="bg-card rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={18} className="text-primary" />
            <h2 className="text-sm font-medium text-foreground">Departments</h2>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {(departments || []).map(d => (
              <span key={d.id} className="text-xs px-3 py-1.5 rounded-lg bg-accent text-accent-foreground font-medium">{d.name}</span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="New department name"
              className="max-w-xs"
              value={newDept}
              onChange={e => setNewDept(e.target.value)}
            />
            <Button variant="outline" size="sm" onClick={handleAddDept} disabled={createDept.isPending}>
              Add
            </Button>
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-card rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone size={18} className="text-primary" />
            <h2 className="text-sm font-medium text-foreground">Announcements</h2>
          </div>
          <div className="space-y-3">
            <Input placeholder="Announcement title" value={annTitle} onChange={e => setAnnTitle(e.target.value)} />
            <Input placeholder="Announcement message" value={annMessage} onChange={e => setAnnMessage(e.target.value)} />
            <Button onClick={handlePublish} disabled={createAnn.isPending}>
              {createAnn.isPending ? "Publishing..." : "Publish Announcement"}
            </Button>
          </div>

          {(announcements || []).length > 0 && (
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              <p className="text-xs text-muted-foreground font-medium">Recent Announcements</p>
              {(announcements || []).slice(0, 5).map(a => (
                <div key={a.id} className="text-sm">
                  <p className="font-medium text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.message} • {new Date(a.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
