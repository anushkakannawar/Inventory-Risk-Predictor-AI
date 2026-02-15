import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import { SKUData, RiskAnalysis } from '@/types/inventory';
import { getRiskLevel } from '@/lib/simulation';
import { motion } from 'framer-motion';

interface RiskDistributionChartProps {
  skus: SKUData[];
  analyses: Map<string, RiskAnalysis>;
  riskType: 'understock' | 'overstock' | 'deadInventory';
  title: string;
}

const riskColors = {
  low: 'hsl(142 71% 45%)',
  medium: 'hsl(38 92% 50%)',
  high: 'hsl(0 84% 60%)',
};

export function RiskDistributionChart({ skus, analyses, riskType, title }: RiskDistributionChartProps) {
  const chartData = useMemo(() => {
    return skus.map((sku) => {
      const analysis = analyses.get(sku.id);
      let riskValue = 0;

      if (analysis) {
        switch (riskType) {
          case 'understock':
            riskValue = analysis.understockRisk;
            break;
          case 'overstock':
            riskValue = analysis.overstockRisk;
            break;
          case 'deadInventory':
            riskValue = analysis.deadInventoryRisk;
            break;
        }
      }

      return {
        name: sku.id.replace('SKU-', ''),
        value: riskValue,
        level: getRiskLevel(riskValue),
      };
    });
  }, [skus, analyses, riskType]);

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              borderColor: 'hsl(var(--border))',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-sm)',
              color: 'hsl(var(--popover-foreground))',
            }}
            formatter={(value: number) => [`${value}%`, 'Risk']}
            labelFormatter={(label) => `SKU-${label}`}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={riskColors[entry.level]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
