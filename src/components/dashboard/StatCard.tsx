'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color?: 'blue' | 'green' | 'orange' | 'purple';
}

export function StatCard({ title, value, icon: Icon, description, trend, color = 'blue' }: StatCardProps) {
  const colorMap = {
    blue: 'text-blue-600 bg-transparent dark:bg-blue-900/10 dark:text-blue-400 border border-transparent dark:border-blue-800/20',
    green: 'text-green-600 bg-transparent dark:bg-green-900/10 dark:text-green-400 border border-transparent dark:border-green-800/20',
    orange: 'text-orange-500 bg-transparent dark:bg-orange-900/10 dark:text-orange-400 border border-transparent dark:border-orange-800/20',
    purple: 'text-purple-600 bg-transparent dark:bg-purple-900/10 dark:text-purple-400 border border-transparent dark:border-purple-800/20',
  };

  return (
    <div className="notion-box p-4 sm:p-5 lg:p-6 border border-black/5 dark:border-white/5 bg-gradient-to-br from-[var(--background)] to-transparent backdrop-blur-sm shadow-sm transition-all duration-300 group flex flex-col justify-between min-h-[140px] sm:min-h-[160px]">
      <div className="flex items-start justify-between">
        <div className={`p-2 sm:p-2.5 rounded-xl ${colorMap[color]} transition-all duration-300`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] sm:text-xs font-black tracking-tighter shadow-sm border ${trend.isUp ? 'text-green-600 bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800/30' : 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800/30'}`}>
            {trend.isUp ? <span className="text-[14px]">↑</span> : <span className="text-[14px]">↓</span>} 
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      
      <div className="mt-4 flex flex-col gap-1">
        <h3 className="text-[10px] sm:text-[11px] font-black text-[var(--muted)] uppercase tracking-[0.15em] opacity-80 group-hover:opacity-100 transition-opacity whitespace-normal leading-tight">
          {title}
        </h3>
        <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[var(--foreground)] tracking-tight break-all leading-tight">
          {value}
        </div>
        {description && <p className="text-[10px] sm:text-xs text-[var(--muted)] mt-1 font-medium font-mono opacity-60 group-hover:opacity-100 transition-opacity line-clamp-1">{description}</p>}
      </div>
    </div>
  );
}
