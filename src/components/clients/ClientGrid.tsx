'use client';

import React from 'react';
import { useLanguage } from '@/lib/languageContext';
import { Client } from './ClientTable';

interface ClientGridProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export function ClientGrid({ clients, onEdit, onDelete }: ClientGridProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {clients.map((c) => (
        <div 
          key={c.id} 
          className="notion-box p-5 border border-border hover:border-[#2383e2] transition-all group relative flex flex-col justify-between h-full shadow-sm hover:shadow-md bg-background"
        >
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-full bg-hover-bg flex items-center justify-center text-muted font-bold text-lg">
                {c.name.charAt(0)}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onEdit(c)}
                  className="p-1.5 text-muted hover:text-[#2383e2] bg-hover-bg rounded-md"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button 
                  onClick={() => onDelete(c)}
                  className="p-1.5 text-muted hover:text-red-500 bg-hover-bg rounded-md"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
            
            <h3 className="font-bold text-lg text-foreground mb-1 leading-tight truncate">
              {c.name}
            </h3>
            <p className="text-muted text-sm mb-2 truncate">
              {c.email || t('common.noEmail')}
            </p>
            {c.phone && (
              <p className="text-muted text-xs mb-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {c.phone}
              </p>
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-border">
            <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">
              ICE: {c.ice || '-'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
