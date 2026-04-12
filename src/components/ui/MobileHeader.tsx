'use client';

import React from 'react';
import { Menu, LayoutDashboard } from 'lucide-react';
import { useCompany } from '@/lib/companyContext';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export default function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const { activeCompany } = useCompany();

  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--background)] sticky top-0 z-40 transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[var(--foreground)] text-[var(--background)] rounded-lg flex items-center justify-center font-bold text-sm shadow-sm ring-1 ring-[var(--border)]">
          {activeCompany?.name?.charAt(0).toUpperCase() || <LayoutDashboard className="w-4 h-4" />}
        </div>
        <span className="font-bold text-lg tracking-tight text-[var(--foreground)] truncate max-w-[150px]">
          {activeCompany?.name || 'Invoice Me'}
        </span>
      </div>

      <button
        onClick={onMenuClick}
        className="p-2.5 rounded-xl hover:bg-[var(--hover-bg)] text-[var(--muted)] hover:text-[var(--foreground)] transition-all active:scale-95 bg-transparent border border-transparent hover:border-[var(--border)]"
        aria-label="Toggle menu"
      >
        <Menu className="w-6 h-6" />
      </button>
    </header>
  );
}
