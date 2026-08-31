import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  colorScheme?: 'amber' | 'emerald' | 'rose' | 'blue' | 'purple' | 'slate' | 'indigo' | 'olive';
  onClick?: () => void;
  badge?: string;
}

const colorStyles = {
  olive: {
    bg: 'bg-white',
    border: 'border-[#E5E5DE]',
    text: 'text-[#2D2D2D]',
    iconBg: 'bg-[#F5F5F0] text-[#5A5A40]',
  },
  amber: {
    bg: 'bg-white',
    border: 'border-[#E5E5DE]',
    text: 'text-[#2D2D2D]',
    iconBg: 'bg-amber-50 text-amber-800 border border-amber-200/60',
  },
  emerald: {
    bg: 'bg-white',
    border: 'border-[#E5E5DE]',
    text: 'text-[#2D2D2D]',
    iconBg: 'bg-emerald-50 text-emerald-800 border border-emerald-200/60',
  },
  rose: {
    bg: 'bg-white',
    border: 'border-[#E5E5DE]',
    text: 'text-[#2D2D2D]',
    iconBg: 'bg-rose-50 text-rose-800 border border-rose-200/60',
  },
  blue: {
    bg: 'bg-white',
    border: 'border-[#E5E5DE]',
    text: 'text-[#2D2D2D]',
    iconBg: 'bg-sky-50 text-sky-800 border border-sky-200/60',
  },
  purple: {
    bg: 'bg-white',
    border: 'border-[#E5E5DE]',
    text: 'text-[#2D2D2D]',
    iconBg: 'bg-stone-100 text-[#5A5A40] border border-stone-200',
  },
  indigo: {
    bg: 'bg-white',
    border: 'border-[#E5E5DE]',
    text: 'text-[#2D2D2D]',
    iconBg: 'bg-[#E2E2D6] text-[#434333] border border-[#D1D1C4]',
  },
  slate: {
    bg: 'bg-white',
    border: 'border-[#E5E5DE]',
    text: 'text-[#2D2D2D]',
    iconBg: 'bg-[#F5F5F0] text-[#5A5A40]',
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'slate',
  onClick,
  badge,
}) => {
  const styles = colorStyles[colorScheme] || colorStyles.slate;

  return (
    <div
      id={id}
      onClick={onClick}
      className={`relative p-5 rounded-3xl border ${styles.bg} ${styles.border} shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-[#D1D1C4] hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#8A8A6F] uppercase tracking-widest">
              {title}
            </span>
            {badge && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#E2E2D6] text-[#434333] border border-[#D1D1C4]">
                {badge}
              </span>
            )}
          </div>
          <div className="text-2xl lg:text-3xl font-serif font-bold text-[#2D2D2D] tracking-tight">
            {value}
          </div>
        </div>
        <div className={`p-3 rounded-2xl ${styles.iconBg} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-[#E5E5DE]">
          {subtitle && <span className="text-[#8A8A6F] truncate">{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold shrink-0 ml-auto ${
                trend.isNeutral
                  ? 'text-[#8A8A6F]'
                  : trend.isPositive
                  ? 'text-emerald-700'
                  : 'text-rose-600'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
