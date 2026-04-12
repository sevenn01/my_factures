"use client";

import { useState, useEffect } from "react";
import ClientTable, { Client } from "@/components/clients/ClientTable";
import { ClientGrid } from "@/components/clients/ClientGrid";
import ClientPanel from "@/components/clients/ClientPanel";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { useCompany } from "@/lib/companyContext";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/languageContext";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import Papa from 'papaparse';

export default function ClientsPage() {
  const { activeCompany, loading: companyLoading } = useCompany();
  const { t } = useLanguage();
  
  const [showPanel, setShowPanel] = useState(false);
  const [panelMode, setPanelMode] = useState<'create'|'edit'|'import'|null>(null);
  const [selectedClient, setSelectedClient] = useState<Client|null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  const [clients, setClients] = useState<Client[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const fetchClients = async () => {
    if (!activeCompany?.id) return;
    setFetching(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', activeCompany.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setClients(data || []);
    } catch (err: any) {
      setError('Could not fetch clients: ' + err.message);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    const savedView = localStorage.getItem('clientViewMode') as 'list' | 'grid';
    if (savedView) setViewMode(savedView);
    fetchClients();
  }, [activeCompany?.id]);

  const handleViewChange = (mode: 'list' | 'grid') => {
    setViewMode(mode);
    localStorage.setItem('clientViewMode', mode);
  };

  const handleDeleteClick = (client: Client) => {
    setDialogConfig({
      isOpen: true,
      title: t('clients.deleteTitle') || 'Delete Client',
      message: t('clients.deleteConfirm'),
      confirmText: t('invoices.delete'),
      type: 'danger',
      onConfirm: () => executeDelete(client.id)
    });
  };

  const executeDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      fetchClients();
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

  const handleSaveClient = () => {
    setShowPanel(false);
    fetchClients();
  };

  const handleExport = () => {
    if (clients.length === 0) return;
    const csv = Papa.unparse(clients.map(c => ({
      Name: c.name,
      Email: c.email,
      Phone: c.phone,
      ICE: c.ice,
      Address: c.address
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "clients.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (companyLoading) {
    return <div className="p-10 text-muted text-center">{t('common.loading')}</div>;
  }

  if (!activeCompany) {
    return <div className="p-10 text-muted text-center">{t('settings.selectWorkspace')}</div>;
  }

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const panelTitle = panelMode === 'create' ? t('clients.newClient') 
                   : panelMode === 'edit' ? t('common.edit')
                   : t('clients.import');

  return (
    <main className="flex-1 p-10 max-w-none mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="notion-title" style={{ fontSize: "1.5rem", margin: 0 }}>{t('clients.title')}</h1>
        <div className="flex items-center gap-4">
          <ViewToggle view={viewMode} onChange={handleViewChange} />
          <button 
            className="notion-btn w-auto px-4 py-2" 
            onClick={() => { setShowPanel(true); setPanelMode('create'); setSelectedClient(null); }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {t('clients.newClient')}
          </button>
          <button 
            className="notion-btn notion-btn-secondary w-auto px-4 py-2" 
            onClick={() => { setShowPanel(true); setPanelMode('import'); setSelectedClient(null); }}
          >
            {t('clients.import')}
          </button>
          <button 
            className="notion-btn notion-btn-secondary w-auto px-4 py-2" 
            onClick={handleExport}
          >
            {t('clients.export')}
          </button>
        </div>
      </div>
      
      {error && <div className="notion-error">{error}</div>}
      
      <div className="mb-6">
        <input 
          className="notion-input max-w-sm" 
          placeholder={`${t('clients.search')} (${clients.length})`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="w-full">
        {fetching && clients.length === 0 ? (
          <div className="p-6 text-muted text-center">{t('clients.loading')}</div>
        ) : viewMode === 'grid' ? (
          <ClientGrid 
            clients={filteredClients} 
            onEdit={(c) => { setShowPanel(true); setPanelMode('edit'); setSelectedClient(c); }}
            onDelete={handleDeleteClick}
          />
        ) : (
          <ClientTable
            clients={filteredClients}
            onEdit={(client) => { setShowPanel(true); setPanelMode('edit'); setSelectedClient(client); }}
            onDelete={handleDeleteClick}
          />
        )}
      </div>

      <SlidePanel 
        isOpen={showPanel} 
        onClose={() => setShowPanel(false)}
        title={panelTitle}
      >
        <ClientPanel
          mode={panelMode}
          client={selectedClient}
          companyId={activeCompany.id}
          onSave={handleSaveClient}
          onClose={() => setShowPanel(false)}
        />
      </SlidePanel>

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
