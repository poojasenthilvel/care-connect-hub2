import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight } from "lucide-react";
import { useBills } from "@/hooks/useSupabaseData";

export default function AdminBilling() {
  const { data: bills } = useBills();

  const totalPaid = (bills || []).filter(b => b.status === "paid").reduce((s, b) => s + Number(b.amount), 0);
  const totalPending = (bills || []).filter(b => b.status === "unpaid").reduce((s, b) => s + Number(b.amount), 0);
  const total = totalPaid + totalPending;
  const collectionRate = total > 0 ? Math.round((totalPaid / total) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Billing Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Revenue and payment analytics</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Revenue" value={`$${(totalPaid / 1000).toFixed(1)}K`} icon={<DollarSign size={18} />} />
          <StatCard label="Total Billed" value={`$${(total / 1000).toFixed(1)}K`} icon={<TrendingUp size={18} />} />
          <StatCard label="Pending" value={`$${(totalPending / 1000).toFixed(1)}K`} icon={<CreditCard size={18} />} />
          <StatCard label="Collections" value={`${collectionRate}%`} icon={<ArrowUpRight size={18} />} />
        </div>

        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="text-sm font-medium text-foreground">All Bills</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted-foreground font-medium">Description</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {(bills || []).length === 0 ? (
                  <tr><td colSpan={4} className="p-4 text-muted-foreground">No bills</td></tr>
                ) : (bills || []).map(b => (
                  <tr key={b.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="p-4 text-foreground font-medium">{b.description}</td>
                    <td className="p-4 font-mono">${Number(b.amount).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                        b.status === "paid" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                      }`}>{b.status}</span>
                    </td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</td>
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
