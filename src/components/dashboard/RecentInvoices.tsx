'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/languageContext';

interface Invoice {
  id: string;
  client_name: string;
  total: number;
  status: string;
  created_at: string;
}

interface RecentInvoicesProps {
  invoices: Invoice[];
  currency?: string;
}

export function RecentInvoices({ invoices, currency = 'DH' }: RecentInvoicesProps) {
  const { t } = useLanguage();

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'sent': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="notion-box p-4 sm:p-6 border border-black/5 dark:border-white/5 bg-background shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-[10px] sm:text-xs font-semibold text-muted uppercase tracking-wider">
          {t('dashboard.recentInvoices') || 'Recent Invoices'}
        </h3>
        <Link href="/invoices" className="text-[10px] sm:text-xs font-semibold text-[#2383e2] hover:underline">
          {t('common.viewAll') || 'View All'} →
        </Link>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {invoices.length === 0 ? (
          <div className="py-8 text-center text-xs sm:text-sm text-muted">
            {t('invoices.noInvoices') || 'No recent invoices'}
          </div>
        ) : (
          invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between group gap-2">
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-bold text-xs sm:text-sm text-foreground truncate">{inv.client_name}</span>
                <span className="text-[9px] sm:text-[10px] text-muted">{new Date(inv.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="text-right flex flex-col items-end">
                  <span className="text-xs sm:text-sm font-bold text-foreground">
                    {inv.total.toFixed(2)} {currency}
                  </span>
                  <span className={`px-1 sm:px-1.5 py-0.5 rounded-[4px] text-[8px] sm:text-[10px] font-bold uppercase tracking-tight ${getStatusStyles(inv.status)}`}>
                    {t(`invoices.${inv.status.toLowerCase()}`)}
                  </span>
                </div>
                <Link 
                  href={`/invoices/${inv.id}/view`} 
                  className="p-1 sm:p-1.5 rounded-md hover:bg-hover-bg text-muted hover:text-[#2383e2] transition-colors"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
