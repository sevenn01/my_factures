'use client';

import React from 'react';
import { useLanguage } from '@/lib/languageContext';
import { useCompany } from '@/lib/companyContext';
import { Product } from './ProductTable';

interface ProductGridProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductGrid({ products, onEdit, onDelete }: ProductGridProps) {
  const { t } = useLanguage();
  const { activeCompany } = useCompany();
  const currency = activeCompany?.currency || 'DH';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((p) => (
        <div 
          key={p.id} 
          className="notion-box p-5 border border-border hover:border-[#2383e2] transition-all group relative flex flex-col justify-between h-full shadow-sm hover:shadow-md bg-background"
        >
          <div>
            <div className="flex justify-between items-start mb-3">
              <span className="px-2 py-1 text-[10px] rounded border uppercase tracking-wider font-bold bg-hover-bg text-muted">
                {t(`builder.${p.type.toLowerCase()}Type`) || p.type}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onEdit(p)}
                  className="p-1.5 text-muted hover:text-[#2383e2] bg-hover-bg rounded-md"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button 
                  onClick={() => onDelete(p)}
                  className="p-1.5 text-muted hover:text-red-500 bg-hover-bg rounded-md"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
            
            <h3 className="font-bold text-lg text-foreground mb-1 leading-tight truncate">
              {p.name}
            </h3>
            <p className="text-muted text-sm mb-4 line-clamp-2 min-h-10">
              {p.description || t('products.noDescription')}
            </p>
          </div>

          <div className="mt-auto pt-4 border-t border-border">
            <span className="text-xl font-bold text-foreground">
              {Number(p.price).toFixed(2)} <span className="text-sm font-medium text-muted">{currency}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
