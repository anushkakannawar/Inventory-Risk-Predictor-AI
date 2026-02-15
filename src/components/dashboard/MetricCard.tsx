import { LucideIcon } from 'lucide-react';
import { BentoCard } from '@/components/common/BentoCard';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: MetricCardProps) {
  const getIconColor = () => {
    switch (variant) {
      case 'success':
        return 'text-risk-low bg-risk-low/10';
      case 'warning':
        return 'text-risk-medium bg-risk-medium/10';
      case 'danger':
        return 'text-risk-high bg-risk-high/10';
      default:
        return 'text-primary bg-primary/10';
    }
  };

  return (
    <BentoCard>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-2 tracking-tight text-foreground">{value}</h3>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={cn("p-3 rounded-2xl", getIconColor())}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1 text-sm">
          <span className={trend.isPositive ? 'text-risk-low' : 'text-risk-high'}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-muted-foreground">vs last period</span>
        </div>
      )}
    </BentoCard>
  );
}
