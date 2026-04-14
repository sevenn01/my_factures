"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCompany } from "@/lib/companyContext";
import { supabase } from "@/lib/supabaseClient";
import { getDirectImageUrl } from "@/lib/utils";
import { useLanguage } from "@/lib/languageContext";
import Link from "next/link";

interface InvoiceData {
  id: string;
  created_at: string;
  status: string;
  total: number;
  sales_taxes: number;
  P_taxes: number;
  clients: {
    name: string;
    email: string;
    phone: string;
    address: string;
    ice: string;
  };
}

interface ItemData {
  id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
    description: string;
  };
}

interface SettingsData {
  header_url: string;
  footer_url: string;
  watermark_url: string;
}

export default function InvoiceViewPage() {
  const params = useParams();
  const router = useRouter();
  const idValue = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { activeCompany } = useCompany();
  const { t } = useLanguage();

  const printRef = useRef<HTMLDivElement>(null);

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [items, setItems] = useState<ItemData[]>([]);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idValue || !activeCompany?.id) return;

    const loadData = async () => {
      setFetching(true);
      try {
        // Fetch Invoice + Client
          const { data: inv, error: invErr } = await supabase
          .from('invoices')
          .select(`
            id, created_at, status, total, sales_taxes, P_taxes,
            clients ( name, email, phone, address, ice )
          `)
          .eq('id', idValue)
          .single();
        if (invErr) throw invErr;

        // Fetch Items + Products
        const { data: itms, error: itmsErr } = await supabase
          .from('invoice_items')
          .select(`
            id, quantity, price,
            products ( name, description )
          `)
          .eq('invoice_id', idValue);
        if (itmsErr) throw itmsErr;

        // Fetch Settings
        const { data: sets } = await supabase
          .from('invoice_settings')
          .select('*')
          .eq('company_id', activeCompany.id)
          .maybeSingle();

        setInvoice(inv as any);
        setItems(itms as any[]);
        setSettings(sets as any);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setFetching(false);
      }
    };
    loadData();
  }, [idValue, activeCompany?.id]);

  const handlePrint = () => {
    // Temporarily blank the title so browser doesn't print "Invoice Me" in header
    const originalTitle = document.title;
    document.title = ' ';
    window.print();
    // Restore title after print dialog closes
    setTimeout(() => { document.title = originalTitle; }, 1000);
  };

  if (fetching) return <div className="p-10 text-muted">{t('view.loading')}</div>;
  if (error) return <div className="p-10 text-red-500">{t('common.error')}: {error}</div>;
  if (!invoice) return <div className="p-10 text-muted">{t('view.notFound')}</div>;

  return (
    <main className="flex-1 p-8 w-full max-w-5xl mx-auto print:p-0 print:m-0 print:max-w-none">
      
      {/* Top Action Bar (hidden on print) */}
      <div className="print:hidden flex items-center justify-between mb-8 bg-background z-50 sticky top-0 py-4 border-b border-border">
        <Link href="/invoices" className="text-muted hover:text-foreground inline-flex items-center gap-2 text-sm transition">
          {t('view.back')}
        </Link>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="notion-btn px-6 py-2">
            {t('view.print')}
          </button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div className="flex justify-center">
        {/* A4 Paper Wrapper */}
        <div 
          ref={printRef} 
          className="relative bg-white text-black w-full max-w-[800px] min-h-[1050px] shadow-lg print:shadow-none print:h-[297mm] print:w-[210mm] print:max-w-none print:min-h-0 print:overflow-hidden"
        >
          {/* Watermark Base Layer */}
          {settings?.watermark_url && (
            <div 
              className="absolute inset-0 z-0 opacity-70 pointer-events-none flex items-center justify-center p-8"
              style={{
                backgroundImage: `url(${getDirectImageUrl(settings.watermark_url)})`,
                backgroundPosition: 'center',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat'
              }}
            />
          )}

          {/* Foreground Layer */}
          <div className="relative z-10 flex flex-col h-full print:h-[297mm]" style={{ pageBreakInside: 'avoid' }}>
            
            {/* Header Content */}
            {settings?.header_url ? (
              <div className="w-full mb-4 print:mb-2">
                <img src={getDirectImageUrl(settings.header_url)} alt="Invoice Header" className="w-full h-auto object-cover max-h-[140px] print:max-h-[140px] object-top" />
              </div>
            ) : (
              <div className="p-12 pb-4">
                <h1 className="text-4xl font-bold uppercase tracking-wider text-gray-800">INVOICE</h1>
                <div className="mt-2 text-gray-500 font-medium">{activeCompany?.name}</div>
              </div>
            )}

            {/* Invoice Meta & Client Info */}
            <div className="px-12 py-4 print:py-2 print:pt-10 print:mt-5 print:px-8 grid grid-cols-2 gap-8 text-sm ">
              <div>
                <p className="text-gray-500 font-semibold mb-1 uppercase text-xs tracking-wider">{t('view.billTo')}</p>
                <p className="font-bold text-gray-800 text-lg">{invoice.clients?.name}</p>
                {invoice.clients?.address && <p className="text-gray-600 mt-1 whitespace-pre-wrap">{invoice.clients.address}</p>}
                {invoice.clients?.email && <p className="text-gray-600 mt-1">{invoice.clients.email}</p>}
                {invoice.clients?.phone && <p className="text-gray-600 mt-1">{invoice.clients.phone}</p>}
                {invoice.clients?.ice && <p className="text-gray-600 mt-1">{t('clients.ice')}: {invoice.clients.ice}</p>}
              </div>
              <div className="text-right">
                <div className="mb-4">
                  <p className="text-gray-500 font-semibold mb-1 uppercase text-xs tracking-wider">{t('view.invoiceReceipt')}</p>
                  <p className="font-bold text-gray-800">#{invoice.id.split('-')[0].toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold mb-1 uppercase text-xs tracking-wider">{t('invoices.date')}</p>
                  <p className="text-gray-800">{new Date(invoice.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className=" px-12 print:px-8 flex-1 mt-4 print:mt-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="py-3 font-bold text-gray-800 uppercase text-xs">{t('view.description')}</th>
                    <th className="py-3 font-bold text-gray-800 uppercase text-xs text-center">{t('view.qty')}</th>
                    <th className="py-3 font-bold text-gray-800 uppercase text-xs text-right">{t('view.unitPrice')}</th>
                    <th className="py-3 font-bold text-gray-800 uppercase text-xs text-right">{t('view.amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id || i} className="border-b border-gray-100">
                      <td className="py-4 pr-4">
                        <p className="font-medium text-gray-800">{item.products?.name}</p>
                        {item.products?.description && (
                          <p className="text-gray-500 text-xs mt-1">{item.products.description}</p>
                        )}
                      </td>
                      <td className="py-4 text-center text-gray-800">{item.quantity}</td>
                      <td className="py-4 text-right text-gray-800">{Number(item.price).toFixed(2)} {activeCompany?.currency || 'DH'}</td>
                      <td className="py-4 text-right font-medium text-gray-800">{(item.quantity * item.price).toFixed(2)} {activeCompany?.currency || 'DH'}</td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400 italic">{t('view.noItems')}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Totals Box */}
              <div className="mt-4 print:mt-2 flex justify-end">
                <div className="w-1/2 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-500 font-medium text-xs uppercase">{t('view.untaxedAmount')}</span>
                    <span className="text-gray-800 font-medium">
                      {(items.reduce((acc, item) => acc + (item.quantity * item.price), 0)).toFixed(2)} {activeCompany?.currency || 'DH'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500 font-medium text-xs uppercase">{t('view.vat')} ({invoice.sales_taxes}%)</span>
                    <span className="text-gray-800 font-medium">
                      {(items.reduce((acc, item) => acc + (item.quantity * item.price), 0) * (invoice.sales_taxes / 100)).toFixed(2)} {activeCompany?.currency || 'DH'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="font-bold text-gray-800 uppercase text-sm tracking-wide">{t('view.totalAmount')}</span>
                    <span className="font-bold text-2xl text-gray-900">
                      {Number(invoice.total).toFixed(2)} {activeCompany?.currency || 'DH'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Space push */}
            <div className="mt-6 print:mt-2" />

            {/* Footer Content */}
            {settings?.footer_url ? (
              <div className="w-full mt-auto">
                <img src={getDirectImageUrl(settings.footer_url)} alt="Invoice Footer" className="w-full h-auto object-cover max-h-[120px] print:max-h-[100px] object-bottom" />
              </div>
            ) : (
              <div className="p-12 pt-8 mt-auto border-t border-gray-200 text-center">
                <p className="text-gray-500 text-sm">{t('view.thankYou')}</p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </main>
  );
}
