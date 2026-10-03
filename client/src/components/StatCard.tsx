import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'rose' | 'amber' | 'blue' | 'purple' | 'stone';
  badge?: {
    text: string;
    type?: 'positive' | 'negative' | 'neutral';
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'stone',
  badge
}) => {
  const variantStyles = {
    emerald: {
      bg: 'bg-emerald-50/60',
      border: 'border-emerald-200/60',
      iconBg: 'bg-emerald-500 text-white',
      valueColor: 'text-emerald-950',
      glow: 'hover:border-emerald-300'
    },
    rose: {
      bg: 'bg-rose-50/60',
      border: 'border-rose-200/60',
      iconBg: 'bg-rose-500 text-white',
      valueColor: 'text-rose-950',
      glow: 'hover:border-rose-300'
    },
    amber: {
      bg: 'bg-amber-50/60',
      border: 'border-amber-200/60',
      iconBg: 'bg-amber-500 text-white',
      valueColor: 'text-amber-950',
      glow: 'hover:border-amber-300'
    },
    blue: {
      bg: 'bg-blue-50/60',
      border: 'border-blue-200/60',
      iconBg: 'bg-blue-600 text-white',
      valueColor: 'text-blue-950',
      glow: 'hover:border-blue-300'
    },
    purple: {
      bg: 'bg-purple-50/60',
      border: 'border-purple-200/60',
      iconBg: 'bg-purple-600 text-white',
      valueColor: 'text-purple-950',
      glow: 'hover:border-purple-300'
    },
    stone: {
      bg: 'bg-white',
      border: 'border-stone-200',
      iconBg: 'bg-stone-800 text-white',
      valueColor: 'text-stone-900',
      glow: 'hover:border-stone-300'
    }
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`rounded-2xl border ${style.border} ${style.bg} p-5 shadow-xs transition-all duration-200 ${style.glow}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${style.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className={`text-2xl sm:text-3xl font-bold tracking-tight ${style.valueColor}`}>
          {value}
        </span>
        {badge && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              badge.type === 'positive'
                ? 'bg-emerald-100 text-emerald-800'
                : badge.type === 'negative'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-stone-100 text-stone-700'
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-stone-500 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};
