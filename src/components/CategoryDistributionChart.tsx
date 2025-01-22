import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--destructive))",
  "hsl(var(--muted))",
];

export const CategoryDistributionChart = () => {
  const { data: chartData } = useQuery({
    queryKey: ["category-distribution"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_analysis")
        .select("category")
        .not("category", "is", null);

      if (error) throw error;

      const categoryCounts = data.reduce((acc: Record<string, number>, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(categoryCounts).map(([name, value]) => ({
        name,
        value,
      }));
    },
  });

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Category Distribution</h3>
        <p className="text-sm text-muted-foreground">
          Distribution of tickets by category
        </p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={(entry) => entry.name}
            >
              {chartData?.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};