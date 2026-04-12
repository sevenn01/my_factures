"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCompany } from "@/lib/companyContext";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/languageContext";
import { InvoiceGrid } from "@/components/invoices/InvoiceGrid";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface Invoice {
  id: string;
  client_id: string;
  status: string;
  total: number;
  created_at: string;
  clients?: { name: string };
}

export default function InvoicesPage() {
  const { activeCompany, loading: companyLoading } = useCompany();
  const { t } = useLanguage();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Dialog State
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    type: 'danger' | 'info' | 'warning';
    onConfirm: () => void;
    hideCancel?: boolean;
  } | null>(null);

  const fetchInvoices = async () => {
    if (!activeCompany?.id) return;
    setFetching(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (name)
        `)
        .eq('company_id', activeCompany.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setInvoices(data || []);
    } catch (err: any) {
      setError('Could not fetch invoices: ' + err.message);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    const savedView = localStorage.getItem('invoiceViewMode') as 'list' | 'grid';
    if (savedView) setViewMode(savedView);
    fetchInvoices();
  }, [activeCompany?.id]);

  const handleViewChange = (mode: 'list' | 'grid') => {
    setViewMode(mode);
    localStorage.setItem('invoiceViewMode', mode);
  };

  const handleDeleteClick = (id: string, status: string) => {
    if (status?.toLowerCase() === 'paid') {
      setDialogConfig({
        isOpen: true,
        title: t('common.notice') || 'Notice',
        message: "Cannot delete a PAID invoice. Please change the status to 'Sent' or 'Draft' first if you really need to delete it.",
        type: 'info',
        hideCancel: true,
        onConfirm: () => setDialogConfig(null)
      });
      return;
    }
    
    setDialogConfig({
      isOpen: true,
      title: t('invoices.deleteTitle') || 'Delete Invoice',
      message: t('invoices.deleteConfirm'),
      confirmText: t('invoices.delete'),
      type: 'danger',
      onConfirm: () => executeDelete(id)
    });
  };

  const executeDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
      fetchInvoices();
    } catch (err: any) {
      setDialogConfig({
        isOpen: true,
        title: t('common.error'),
        message: err.message,
        type: 'danger',
        hideCancel: true,
        onConfirm: () => setDialogConfig(null)
      });
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totals = filteredInvoices.reduce((acc, inv) => {
    const s = inv.status?.toLowerCase();
    if (s === 'paid') acc.paid += Number(inv.total);
    else if (s === 'draft' || s === 'sent') acc.unpaid += Number(inv.total);
    return acc;
  }, { paid: 0, unpaid: 0 });

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'Sent': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };

  if (companyLoading) {
    return <div className="p-10 text-muted text-center">{t('common.loading')}</div>;
  }

  if (!activeCompany) {
    return <div className="p-10 text-muted text-center">{t('settings.selectWorkspace')}</div>;
  }

  return (
    <main className="flex-1 p-10 max-w-none mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="notion-title" style={{ fontSize: "1.5rem", margin: 0 }}>{t('invoices.title')}</h1>
        <div className="flex items-center gap-4">
          <ViewToggle view={viewMode} onChange={handleViewChange} />
          <Link href="/invoices/new" className="notion-btn w-auto px-4 py-2 no-underline">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {t('invoices.newInvoice')}
          </Link>
        </div>
      </div>
      
      {error && <div className="notion-error">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="notion-box p-4 border border-border flex flex-col justify-center">
          <span className="text-xs uppercase tracking-wider text-muted font-semibold mb-1">{t('invoices.paidTotal')}</span>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {totals.paid.toFixed(2)} {activeCompany?.currency || 'DH'}
          </span>
        </div>
        <div className="notion-box p-4 border border-border flex flex-col justify-center">
          <span className="text-xs uppercase tracking-wider text-muted font-semibold mb-1">{t('invoices.unpaidTotal')}</span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {totals.unpaid.toFixed(2)} {activeCompany?.currency || 'DH'}
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input 
            className="notion-input mb-0" 
            placeholder={`${t('invoices.search')} (${filteredInvoices.length})`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <select 
            className="notion-input mb-0"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{t('invoices.allStatuses')}</option>
            <option value="draft">{t('invoices.draft')}</option>
            <option value="sent">{t('invoices.sent')}</option>
            <option value="paid">{t('invoices.paid')}</option>
            <option value="cancelled">{t('invoices.cancelled')}</option>
          </select>
        </div>
      </div>

      <div className="w-full">
        {fetching && invoices.length === 0 ? (
          <div className="p-6 text-muted text-center">{t('invoices.loading')}</div>
        ) : viewMode === 'grid' ? (
          <InvoiceGrid 
            invoices={filteredInvoices} 
            onDelete={handleDeleteClick} 
          />
        ) : (
          <div className="w-full overflow-x-auto pb-4">
            <table className="notion-table w-full min-w-[500px]">
              <thead>
                <tr>
                  <th>{t('invoices.client')}</th>
                  <th>{t('invoices.date')}</th>
                  <th>{t('invoices.status')}</th>
                  <th>{t('invoices.total')}</th>
                  <th className="text-right">{t('invoices.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="group">
                    <td className="font-medium text-foreground">{inv.clients?.name || t('builder.select')}</td>
                    <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`px-2 py-0.5 text-xs rounded border uppercase tracking-wide font-medium ${getStatusStyles(inv.status)}`}>
                        {t(`invoices.${inv.status.toLowerCase()}`)}
                      </span>
                    </td>
                    <td>{Number(inv.total).toFixed(2)} {activeCompany?.currency || 'DH'}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2 pr-2">
                        <Link href={`/invoices/${inv.id}/view`} className="text-[#2383e2] hover:underline transition">{t('invoices.view')}</Link>
                        <Link href={`/invoices/${inv.id}`} className="text-muted hover:text-foreground transition">{t('invoices.edit')}</Link>
                        <button className="text-red-400 hover:text-red-600 transition" onClick={() => handleDeleteClick(inv.id, inv.status)}>{t('invoices.delete')}</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted bg-hover-bg/30 rounded-lg">{t('invoices.noInvoices')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!dialogConfig?.isOpen}
        onClose={() => setDialogConfig(null)}
        onConfirm={dialogConfig?.onConfirm || (() => {})}
        title={dialogConfig?.title || ''}
        message={dialogConfig?.message || ''}
        confirmText={dialogConfig?.confirmText}
        type={dialogConfig?.type}
        hideCancel={dialogConfig?.hideCancel}
      />
    </main>
  );
}
