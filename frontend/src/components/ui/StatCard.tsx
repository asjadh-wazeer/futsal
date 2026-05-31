import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  iconBg?: string;
  iconColor?: string;
}

export default function StatCard({ title, value, subtitle, icon: Icon, trend, iconBg = 'bg-brand-100', iconColor = 'text-brand-600' }: Props) {
  return (
    <div className="card flex items-start gap-4">
      <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
        <Icon className={clsx('w-6 h-6', iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        {trend && (
          <div className={clsx('flex items-center gap-1 mt-1 text-xs font-medium', trend.positive ? 'text-green-600' : 'text-red-500')}>
            <span>{trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
            <span className="text-gray-400 font-normal">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
