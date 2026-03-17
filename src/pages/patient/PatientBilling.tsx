import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { CreditCard, DollarSign, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBills, usePayBill } from "@/hooks/useSupabaseData";

export default function PatientBilling() {
  const { data: bills, isLoading } = useBills();
  const payBill = usePayBill();

  const totalDue = (bills || []).filter(b => b.status === "unpaid").reduce((s, b) => s + Number(b.amount), 0);
  const totalPaid = (bills || []).filter(b => b.status === "paid").reduce((s, b) => s + Number(b.amount), 0);
  const nextDue = (bills || []).find(b => b.status === "unpaid" && b.due_date);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Billing & Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your bills and insurance</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Due" value={`$${totalDue.toFixed(0)}`} icon={<DollarSign size={18} />} />
          <StatCard label="Total Paid" value={`$${totalPaid.toFixed(0)}`} icon={<CreditCard size={18} />} />
          <StatCard label="Insurance" value="Active" icon={<Shield size={18} />} />
          <StatCard label="Next Due" value={nextDue?.due_date ? new Date(nextDue.due_date).toLocaleDateString("en", { month: "short", day: "numeric" }) : "—"} icon={<Clock size={18} />} />
        </div>

        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="text-sm font-medium text-foreground">Payment History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted-foreground font-medium">Description</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Date</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="p-4 text-muted-foreground">Loading...</td></tr>
                ) : (bills || []).length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-muted-foreground">No bills found</td></tr>
                ) : (bills || []).map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="p-4 text-foreground font-medium">{b.description}</td>
                    <td className="p-4 font-mono text-foreground">${Number(b.amount).toFixed(2)}</td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                        b.status === "paid" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                      }`}>{b.status === "paid" ? "Paid" : "Unpaid"}</span>
                    </td>
                    <td className="p-4 text-right">
                      {b.status === "unpaid" && (
                        <Button size="sm" onClick={() => payBill.mutate(b.id)} disabled={payBill.isPending}>
                          Pay Now
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
