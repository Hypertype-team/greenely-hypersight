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
  "#9b87f5", // Primary Purple
  "#0EA5E9", // Ocean Blue
  "#F97316", // Bright Orange
  "#D946EF", // Magenta Pink
  "#8B5CF6", // Vivid Purple
  "#1EAEDB", // Bright Blue
  "#7E69AB", // Secondary Purple
  "#33C3F0", // Sky Blue
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

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
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {chartData?.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} tickets`, 'Count']}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--background)',
              }}
            />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              wrapperStyle={{
                paddingTop: '20px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};