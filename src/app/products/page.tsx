"use client";

import { useState, useEffect } from "react";
import ProductTable, { Product } from "@/components/products/ProductTable";
import { ProductGrid } from "@/components/products/ProductGrid";
import ProductPanel from "@/components/products/ProductPanel";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { useCompany } from "@/lib/companyContext";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/languageContext";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import Papa from 'papaparse';

export default function ProductsPage() {
  const { activeCompany, loading: companyLoading } = useCompany();
  const { t } = useLanguage();
  
  const [showPanel, setShowPanel] = useState(false);
  const [panelMode, setPanelMode] = useState<'create'|'edit'|'import'|null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product|null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

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

  const fetchProducts = async () => {
    if (!activeCompany?.id) return;
    setFetching(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', activeCompany.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      setError('Could not fetch products: ' + err.message);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    const savedView = localStorage.getItem('productViewMode') as 'list' | 'grid';
    if (savedView) setViewMode(savedView);
    fetchProducts();
  }, [activeCompany?.id]);

  const handleViewChange = (mode: 'list' | 'grid') => {
    setViewMode(mode);
    localStorage.setItem('productViewMode', mode);
  };

  const handleDeleteClick = (product: Product) => {
    setDialogConfig({
      isOpen: true,
      title: t('products.deleteTitle') || 'Delete Product',
      message: t('products.deleteConfirm'),
      confirmText: t('invoices.delete'),
      type: 'danger',
      onConfirm: () => executeDelete(product.id)
    });
  };

  const executeDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      fetchProducts();
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

  const handleSaveProduct = () => {
    setShowPanel(false);
    fetchProducts();
  };

  const handleExport = () => {
    if (products.length === 0) return;
    const csv = Papa.unparse(products.map(p => ({
      Name: p.name,
      Type: p.type,
      Price: p.price,
      Description: p.description
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "products.csv");
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

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const panelTitle = panelMode === 'create' ? t('products.newProduct') 
                   : panelMode === 'edit' ? t('common.edit') 
                   : t('products.import');

  return (
    <main className="flex-1 p-10 max-w-none mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="notion-title" style={{ fontSize: "1.5rem", margin: 0 }}>{t('products.title')}</h1>
        <div className="flex items-center gap-4">
          <ViewToggle view={viewMode} onChange={handleViewChange} />
          <button 
            className="notion-btn w-auto px-4 py-2" 
            onClick={() => { setShowPanel(true); setPanelMode('create'); setSelectedProduct(null); }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {t('products.newProduct')}
          </button>
          <button 
            className="notion-btn notion-btn-secondary w-auto px-4 py-2" 
            onClick={() => { setShowPanel(true); setPanelMode('import'); setSelectedProduct(null); }}
          >
            {t('products.import')}
          </button>
          <button 
            className="notion-btn notion-btn-secondary w-auto px-4 py-2" 
            onClick={handleExport}
          >
            {t('products.export')}
          </button>
        </div>
      </div>
      
      {error && <div className="notion-error">{error}</div>}
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input 
            className="notion-input mb-0" 
            placeholder={`${t('products.search')} (${products.length})`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <select 
            className="notion-input mb-0"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">{t('builder.allTypes')}</option>
            <option value="Product">{t('builder.productType')}</option>
            <option value="Service">{t('builder.serviceType')}</option>
          </select>
        </div>
      </div>

      <div className="w-full">
        {fetching && products.length === 0 ? (
          <div className="p-6 text-muted text-center">{t('products.loading')}</div>
        ) : viewMode === 'grid' ? (
          <ProductGrid 
            products={filteredProducts} 
            onEdit={(p) => { setShowPanel(true); setPanelMode('edit'); setSelectedProduct(p); }}
            onDelete={handleDeleteClick}
          />
        ) : (
          <ProductTable
            products={filteredProducts}
            onEdit={(product) => { setShowPanel(true); setPanelMode('edit'); setSelectedProduct(product); }}
            onDelete={handleDeleteClick}
          />
        )}
      </div>

      <SlidePanel 
        isOpen={showPanel} 
        onClose={() => setShowPanel(false)}
        title={panelTitle}
      >
        <ProductPanel
          mode={panelMode}
          product={selectedProduct}
          companyId={activeCompany.id}
          onSave={handleSaveProduct}
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
