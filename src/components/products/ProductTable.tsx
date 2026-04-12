import React from "react";
import { useCompany } from "@/lib/companyContext";
import { useLanguage } from "@/lib/languageContext";

export interface Product {
  id: string; 
  company_id: string;
  name: string;
  type: string;
  description?: string;
  price: number;
  sales_taxes?: number;
  created_at: string;
}

export default function ProductTable({ products, onEdit, onDelete }:{
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}) {
  const { activeCompany } = useCompany();
  const { t } = useLanguage();
  const currency = activeCompany?.currency || 'DH';

  return (
    <div className="w-full overflow-x-auto pb-4">
      <table className="notion-table w-full min-w-[500px]">
        <thead>
          <tr>
            <th>{t('products.name')}</th>
            <th>{t('products.type')}</th>
            <th>{t('products.price')}</th>
            <th>{t('products.description')}</th>
            <th className="text-right">{t('invoices.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td className="font-medium text-foreground">{p.name}</td>
              <td className="text-muted">{t(`builder.${p.type.toLowerCase()}Type`) || p.type}</td>
              <td className="text-foreground">{p.price} {currency}</td>
              <td className="text-muted truncate max-w-[200px]" title={p.description}>{p.description}</td>
              <td className="text-right whitespace-nowrap">
                <button className="text-muted hover:text-foreground transition px-2" onClick={() => onEdit(p)}>{t('invoices.edit')}</button>
                <button className="text-red-400 hover:text-red-600 transition px-2" onClick={() => onDelete(p)}>{t('invoices.delete')}</button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-8 text-muted">{t('products.noProducts')}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
