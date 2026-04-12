'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/languageContext';
import { useCompany } from '@/lib/companyContext';

interface Invoice {
  id: string;
  client_id: string;
  status: string;
  total: number;
  created_at: string;
  clients?: { name: string };
}

interface InvoiceGridProps {
  invoices: Invoice[];
  onDelete: (id: string, status: string) => void;
}

export function InvoiceGrid({ invoices, onDelete }: InvoiceGridProps) {
  const { t } = useLanguage();
  const { activeCompany } = useCompany();

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'Sent': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {invoices.map((inv) => (
        <div 
          key={inv.id} 
          className="notion-box p-5 border border-border hover:border-[#2383e2] transition-all group relative flex flex-col justify-between h-full shadow-sm hover:shadow-md bg-background"
        >
          <div>
            <div className="flex justify-between items-start mb-3">
              <span className={`px-2 py-1 text-[10px] rounded border uppercase tracking-wider font-bold ${getStatusStyles(inv.status)}`}>
                {t(`invoices.${inv.status.toLowerCase()}`)}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/invoices/${inv.id}`} className="p-1.5 text-muted hover:text-[#2383e2] bg-hover-bg rounded-md">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </Link>
                <button 
                  onClick={() => onDelete(inv.id, inv.status)}
                  className="p-1.5 text-muted hover:text-red-500 bg-hover-bg rounded-md"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
            
            <h3 className="font-bold text-lg text-foreground mb-1 leading-tight truncate">
              {inv.clients?.name || t('builder.select')}
            </h3>
            <p className="text-muted text-sm mb-4">
              {new Date(inv.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
            <span className="text-xl font-bold text-foreground">
              {Number(inv.total).toFixed(2)} <span className="text-sm font-medium text-muted">{activeCompany?.currency || 'DH'}</span>
            </span>
            <Link 
              href={`/invoices/${inv.id}/view`} 
              className="text-xs font-semibold text-[#2383e2] hover:underline"
            >
              {t('invoices.view')} →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
