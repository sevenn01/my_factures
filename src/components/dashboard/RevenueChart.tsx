'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { useLanguage } from '@/lib/languageContext';

interface RevenueChartProps {
  data: {
    name: string;
    total: number;
    paid: number;
  }[];
  currency?: string;
}

export function RevenueChart({ data, currency = 'DH' }: RevenueChartProps) {
  const { t } = useLanguage();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="notion-box p-4 sm:p-6 border border-black/5 dark:border-white/5 bg-background shadow-sm h-[320px] sm:h-[400px] flex items-center justify-center">
        <div className="text-muted animate-pulse text-xs tracking-widest uppercase">Loading Chart...</div>
      </div>
    );
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <div className="notion-box p-4 sm:p-6 border border-black/5 dark:border-white/5 bg-background shadow-sm h-[320px] sm:h-[400px] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h3 className="text-[10px] sm:text-xs font-semibold text-muted uppercase tracking-wider">
          {t('dashboard.revenueChart') || 'Revenue Overview'}
        </h3>
        <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-medium">
          <div className="flex items-center gap-1.5 text-muted">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-[#2383e2]" />
            {t('invoices.invoiced') || 'Invoiced'}
          </div>
          <div className="flex items-center gap-1.5 text-muted">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-green-500" />
            {t('invoices.paid') || 'Paid'}
          </div>
        </div>
      </div>

      <div className="flex-1 w-full mt-2 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 10 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 10 }} 
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.03)' }} 
              contentStyle={{ 
                backgroundColor: 'var(--background)', 
                borderColor: 'var(--border)', 
                borderRadius: '8px',
                fontSize: '10px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }} 
              itemStyle={{ fontWeight: 'bold', padding: '2px 0' }}
              formatter={(value: any) => [`${value.toFixed(2)} ${currency}`, '']}
            />
            <Bar 
              dataKey="total" 
              fill="#2383e2" 
              radius={[2, 2, 0, 0]} 
              barSize={isMobile ? 12 : 24}
            />
            <Bar 
              dataKey="paid" 
              fill="#10b981" 
              radius={[2, 2, 0, 0]} 
              barSize={isMobile ? 12 : 24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
