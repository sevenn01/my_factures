'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCompany } from "@/lib/companyContext";
import { useTheme } from "@/lib/themeContext";
import { useLanguage } from "@/lib/languageContext";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  FileText,
  LogOut,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/lib/authContext";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { activeCompany } = useCompany();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const { signOut } = useAuth();

  // Hide sidebar on these routes
  if (['/login', '/signup', '/company-setup'].includes(pathname)) {
    return null;
  }

  const handleLogout = async () => {
    try {
      if (confirm(t('common.logout') + '?')) {
        await signOut();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside className={`print-hide fixed lg:sticky top-0 left-0 z-50 w-64 h-screen border-r border-[var(--border)] bg-[var(--background)] p-4 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} text-[14px]`}>
        
        {/* Workspace Selector */}
        <div className="flex items-center gap-3 mb-8 p-2.5 hover:bg-[var(--hover-bg)] rounded-xl cursor-pointer transition-all active:scale-[0.98] select-none border border-transparent hover:border-[var(--border)] group">
          <div className="w-8 h-8 bg-[var(--foreground)] text-[var(--background)] rounded-lg flex items-center justify-center font-black text-sm shadow-md group-hover:shadow-[var(--focus-ring)] transition-all">
            {activeCompany?.name?.charAt(0).toUpperCase() || 'W'}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="font-bold text-[var(--foreground)] truncate leading-tight">
              {activeCompany?.name || 'Workspace'}
            </div>
            <div className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest mt-0.5">Workspace</div>
          </div>
          <svg className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
        </div>

        <nav className="flex flex-col gap-1.5 text-[var(--muted)] font-bold">
          <Link href="/dashboard" onClick={onClose} className={`py-2 px-3 rounded-lg hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)] transition-all flex items-center gap-2.5 ${pathname === '/dashboard' ? 'bg-[var(--hover-bg)] text-[var(--foreground)] shadow-sm' : ''}`}>
            <LayoutDashboard className="w-4 h-4" />
            {t('sidebar.dashboard')}
          </Link>
          <Link href="/products" onClick={onClose} className={`py-2 px-3 rounded-lg hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)] transition-all flex items-center gap-2.5 ${pathname === '/products' ? 'bg-[var(--hover-bg)] text-[var(--foreground)] shadow-sm' : ''}`}>
            <Package className="w-4 h-4" />
            {t('sidebar.products')}
          </Link>
          <Link href="/clients" onClick={onClose} className={`py-2 px-3 rounded-lg hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)] transition-all flex items-center gap-2.5 ${pathname === '/clients' ? 'bg-[var(--hover-bg)] text-[var(--foreground)] shadow-sm' : ''}`}>
            <Users className="w-4 h-4" />
            {t('sidebar.clients')}
          </Link>
          <Link href="/invoices" onClick={onClose} className={`py-2 px-3 rounded-lg hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)] transition-all flex items-center gap-2.5 ${pathname.startsWith('/invoices') ? 'bg-[var(--hover-bg)] text-[var(--foreground)] shadow-sm' : ''}`}>
            <FileText className="w-4 h-4" />
            {t('sidebar.invoices')}
          </Link>
        </nav>

        <div className="mt-10 flex flex-col gap-1.5 text-[var(--muted)] font-bold">
          <div className="text-[10px] font-black text-[var(--muted)] px-3 mb-2 uppercase tracking-[0.2em] opacity-70 italic">{t('sidebar.settings')}</div>
          <Link href="/settings" onClick={onClose} className={`py-2 px-3 rounded-lg hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)] transition-all flex items-center gap-2.5 ${pathname === '/settings' ? 'bg-[var(--hover-bg)] text-[var(--foreground)] shadow-sm' : ''}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {t('sidebar.settings')}
          </Link>
        </div>

        <div className="flex-1" />

        <div className="px-2 space-y-4">
          {/* Plan Info - Compact */}
          <div className="p-3 bg-[var(--hover-bg)] rounded-xl border border-[var(--border)] group cursor-pointer hover:border-blue-500/30 transition-all shadow-sm" onClick={() => alert("Upgrade to add more workspaces!")}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-500" />
                {t('sidebar.freePlan')}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
            </div>
            <p className="text-[10px] text-[var(--muted)] font-bold">{t('sidebar.workspaceLimit')}</p>
          </div>

          <div className="space-y-1">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[var(--hover-bg)] transition-all text-[var(--muted)] hover:text-[var(--foreground)] text-[12px] w-full font-bold group"
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
              <span className="flex-1 text-left uppercase tracking-widest">{theme === 'dark' ? t('settings.light') : t('settings.dark')}</span>
            </button>

            {/* Logout Button */}
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-red-500/10 transition-all text-[var(--muted)] hover:text-red-500 text-[12px] w-full font-bold group"
            >
              <LogOut className="w-4 h-4" />
              <span className="flex-1 text-left uppercase tracking-widest">{t('common.logout')}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

