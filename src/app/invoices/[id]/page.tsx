"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCompany } from "@/lib/companyContext";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useLanguage } from "@/lib/languageContext";

export default function InvoiceBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params?.id;
  const idValue = Array.isArray(rawId) ? rawId[0] : rawId;
  const isNew = idValue === 'new';

  const { activeCompany } = useCompany();
  const { t } = useLanguage();
  
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [clientId, setClientId] = useState("");
  const [status, setStatus] = useState("draft");
  const [salesTaxes, setSalesTaxes] = useState(0);
  const [pTaxes, setPTaxes] = useState(0);
  const [items, setItems] = useState<{product_id: string, quantity: number, price: number}[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeCompany?.id) return;

    const fetchData = async () => {
      setFetching(true);
      try {
        const [cls, prds] = await Promise.all([
          supabase.from('clients').select('id, name').eq('company_id', activeCompany.id),
          supabase.from('products').select('id, name, price').eq('company_id', activeCompany.id)
        ]);
        
        setClients(cls.data || []);
        setProducts(prds.data || []);

        if (!isNew && idValue) {
          const { data: inv } = await supabase.from('invoices').select('*').eq('id', idValue).single();
          if (inv) {
            setClientId(inv.client_id || "");
            setStatus(inv.status || "draft");
            setSalesTaxes(inv.sales_taxes || 0);
            setPTaxes(inv.P_taxes || 0);
            
            const { data: itms } = await supabase.from('invoice_items').select('*').eq('invoice_id', idValue);
            setItems(itms || []);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setFetching(false);
      }
    };
    
    fetchData();
  }, [activeCompany?.id, idValue, isNew]);

  const addItem = () => setItems([...items, { product_id: "", quantity: 1, price: 0 }]);
  
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    
    // Auto-fill price if product is selected
    if (field === 'product_id') {
      const prod = products.find(p => p.id === value);
      if (prod) {
        newItems[index].price = prod.price;
      }
    }
    setItems(newItems);
  };
  
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateUntaxedTotal = () => {
    return items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  };

  const calculateVAT = () => {
    return calculateUntaxedTotal() * (salesTaxes / 100);
  };

  const calculateTotal = () => {
    return calculateUntaxedTotal() + calculateVAT();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany) return;
    setLoading(true);
    setError(null);
    try {
      const total = calculateTotal();
      
      let invoiceId = idValue;
      
      if (isNew) {
        const { data: inv, error: invErr } = await supabase.from('invoices').insert({
          company_id: activeCompany.id,
          client_id: clientId,
          status,
          sales_taxes: salesTaxes,
          P_taxes: pTaxes,
          total
        }).select('id').single();
        if (invErr) throw invErr;
        invoiceId = inv.id;
      } else {
        const { error: invErr } = await supabase.from('invoices').update({
          client_id: clientId,
          status,
          sales_taxes: salesTaxes,
          P_taxes: pTaxes,
          total
        }).eq('id', invoiceId);
        if (invErr) throw invErr;
        
        // Remove old items to replace them simply
        await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId);
      }
      
      if (items.length > 0) {
        const itemsToInsert = items.map(item => ({
          invoice_id: invoiceId,
          product_id: item.product_id,
          quantity: Number(item.quantity),
          price: Number(item.price)
        }));
        
        const { error: itemsErr } = await supabase.from('invoice_items').insert(itemsToInsert);
        if (itemsErr) throw itemsErr;
      }

      router.push('/invoices');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-10 text-muted">{t('builder.loading')}</div>;

  const untaxedTotal = calculateUntaxedTotal();
  const vatAmount = calculateVAT();
  const grandTotal = calculateTotal();
  const currency = activeCompany?.currency || "DH";

  return (
    <main className="flex-1 p-10 w-full">
      <Link href="/invoices" className="text-muted hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm transition">
        {t('builder.back')}
      </Link>
      
      <div className="flex items-center justify-between mb-8">
        <h1 className="notion-title" style={{ fontSize: "2rem", margin: 0 }}>
          {isNew ? t('builder.newInvoice') : t('builder.editInvoice')}
        </h1>
      </div>
      
      {error && <div className="notion-error">{error}</div>}

      <form onSubmit={handleSave} className="space-y-8">
        <div className="notion-box max-w-none! w-full!">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="notion-label">{t('invoices.client')}</label>
              <select className="notion-input" value={clientId} onChange={e => setClientId(e.target.value)} required>
                <option value="" disabled>{t('builder.selectClient')}</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="notion-label">{t('invoices.status')}</label>
              <select className="notion-input" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="draft">{t('invoices.draft')}</option>
                <option value="sent">{t('invoices.sent')}</option>
                <option value="paid">{t('invoices.paid')}</option>
                <option value="cancelled">{t('invoices.cancelled')}</option>
              </select>
            </div>
            <div>
              <label className="notion-label">{t('builder.salesTax')}</label>
              <select className="notion-input" value={salesTaxes} onChange={e => setSalesTaxes(Number(e.target.value))}>
                {[0, 7, 10, 14, 20].map(v => <option key={v} value={v}>{v}%</option>)}
              </select>
            </div>
            <div>
              <label className="notion-label">{t('builder.purchaseTax')}</label>
              <select className="notion-input" value={pTaxes} onChange={e => setPTaxes(Number(e.target.value))}>
                {[0, 7, 10, 14, 20].map(v => <option key={v} value={v}>{v}%</option>)}
              </select>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">{t('builder.lineItems')}</h2>
            <button type="button" onClick={addItem} className="text-sm font-medium text-[#2383e2] hover:underline flex items-center gap-1">
              {t('builder.addItem')}
            </button>
          </div>
          
          <div className="notion-box p-0! max-w-none! w-full! overflow-hidden">
            <table className="notion-table">
              <thead>
                <tr>
                  <th className="w-1/2">{t('builder.product')}</th>
                  <th className="w-1/6">{t('builder.qty')}</th>
                  <th className="w-1/6">{t('builder.price')}</th>
                  <th className="w-1/6 text-right">{t('builder.amount')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-transparent">
                    <td className="p-2 border-b">
                      <select className="notion-input !mb-0 !p-1 font-medium bg-transparent border-transparent hover:border-border focus:border-[#2383e2]" 
                        value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)} required>
                        <option value="" disabled>{t('builder.select')}</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </td>
                    <td className="p-2 border-b">
                      <input className="notion-input !mb-0 !p-1 bg-transparent border-transparent hover:border-border focus:border-[#2383e2]" 
                        type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} required />
                    </td>
                    <td className="p-2 border-b">
                      <input className="notion-input !mb-0 !p-1 bg-transparent border-transparent hover:border-border focus:border-[#2383e2]" 
                        type="number" step="0.01" value={item.price} onChange={e => updateItem(idx, 'price', Number(e.target.value))} required />
                    </td>
                    <td className="p-2 border-b text-right text-muted font-mono text-sm leading-[38px]">
                      {(item.quantity * item.price).toFixed(2)} {currency}
                    </td>
                    <td className="p-2 border-b text-right">
                      <button type="button" onClick={() => removeItem(idx)} className="text-muted hover:text-red-500 leading-[38px]">&times;</button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-muted border-b">{t('builder.noItems')}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3} className="p-2 text-right font-medium text-muted">{t('builder.untaxedAmount')}</td>
                  <td className="p-2 text-right font-medium">{untaxedTotal.toFixed(2)} {currency}</td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={3} className="p-2 text-right font-medium text-muted">{t('view.vat')} ({salesTaxes}%)</td>
                  <td className="p-2 text-right font-medium">{vatAmount.toFixed(2)} {currency}</td>
                  <td></td>
                </tr>
                <tr className="bg-hover-bg">
                  <td colSpan={3} className="p-4 text-right font-bold text-foreground">{t('view.total')}</td>
                  <td className="p-4 text-right font-bold text-lg">{grandTotal.toFixed(2)} {currency}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          <Link href="/invoices" className="notion-btn notion-btn-secondary px-6">{t('builder.cancel')}</Link>
          <button type="submit" disabled={loading} className="notion-btn px-6">
            {loading ? t('builder.saving') : t('builder.save')}
          </button>
        </div>
      </form>
    </main>
  );
}
