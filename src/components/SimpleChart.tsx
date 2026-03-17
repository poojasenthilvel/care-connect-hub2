import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface SimpleChartProps {
  data: Array<Record<string, any>>;
  dataKey: string;
  xKey: string;
  type?: "line" | "bar";
  color?: string;
  title: string;
  height?: number;
}

export default function SimpleChart({ data, dataKey, xKey, type = "line", color = "hsl(214, 100%, 50%)", title, height = 200 }: SimpleChartProps) {
  return (
    <div className="bg-card rounded-xl p-5 shadow-card">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        {type === "line" ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} stroke="hsl(215, 16%, 47%)" />
            <YAxis tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} stroke="hsl(215, 16%, 47%)" />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} stroke="hsl(215, 16%, 47%)" />
            <YAxis tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} stroke="hsl(215, 16%, 47%)" />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
