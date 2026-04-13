'use client'

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useCompany } from "@/lib/companyContext";
import { useTheme } from "@/lib/themeContext";
import { useLanguage } from "@/lib/languageContext";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  FileText,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon
} from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeCompany } = useCompany();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const { signOut } = useAuth();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUpgradePopupOpen, setIsUpgradePopupOpen] = useState(false);
  const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false);

  // Hide sidebar on these routes
  if (['/login', '/signup', '/company-setup'].includes(pathname)) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOut();
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

      <aside className={`print-hide fixed lg:sticky top-0 left-0 z-50 h-screen border-r border-[var(--border)] bg-[var(--background)] p-4 flex flex-col transform transition-all duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'lg:w-20 w-64' : 'w-64'} text-[14px]`}>
        
        {/* Collapse Toggle (Desktop only) */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-[var(--background)] border border-[var(--border)] rounded-full items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:scale-110 transition-all z-10 cursor-pointer shadow-sm"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* Workspace Selector -> Links to Settings */}
        <Link 
          href="/settings"
          onClick={onClose}
          className={`flex items-center gap-3 mb-8 p-2.5 hover:bg-[var(--hover-bg)] rounded-xl cursor-pointer transition-all active:scale-[0.98] select-none border border-transparent hover:border-[var(--border)] group ${isCollapsed ? 'lg:justify-center' : ''}`}
        >
          <div className="w-8 h-8 shrink-0 bg-[var(--foreground)] text-[var(--background)] rounded-lg flex items-center justify-center font-black text-sm shadow-md group-hover:shadow-[var(--focus-ring)] transition-all">
            {activeCompany?.name?.charAt(0).toUpperCase() || 'W'}
          </div>
          <div className={`flex flex-col min-w-0 flex-1 overflow-hidden transition-all duration-200 ${isCollapsed ? 'lg:hidden' : ''}`}>
            <div className="font-bold text-[var(--foreground)] truncate leading-tight">
              {activeCompany?.name || 'Workspace'}
            </div>
            <div className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest mt-0.5">Settings</div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5 text-[var(--muted)] font-bold flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
          <Link href="/dashboard" onClick={onClose} className={`py-2 px-3 rounded-lg hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)] transition-all flex items-center gap-2.5 cursor-pointer hover:scale-[1.02] ${pathname === '/dashboard' ? 'bg-[var(--hover-bg)] text-[var(--foreground)] shadow-sm' : ''} ${isCollapsed ? 'lg:justify-center' : ''}`}>
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span className={`truncate ${isCollapsed ? 'lg:hidden' : ''}`}>{t('sidebar.dashboard')}</span>
          </Link>
          <Link href="/products" onClick={onClose} className={`py-2 px-3 rounded-lg hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)] transition-all flex items-center gap-2.5 cursor-pointer hover:scale-[1.02] ${pathname === '/products' ? 'bg-[var(--hover-bg)] text-[var(--foreground)] shadow-sm' : ''} ${isCollapsed ? 'lg:justify-center' : ''}`}>
            <Package className="w-4 h-4 shrink-0" />
            <span className={`truncate ${isCollapsed ? 'lg:hidden' : ''}`}>{t('sidebar.products')}</span>
          </Link>
          <Link href="/clients" onClick={onClose} className={`py-2 px-3 rounded-lg hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)] transition-all flex items-center gap-2.5 cursor-pointer hover:scale-[1.02] ${pathname === '/clients' ? 'bg-[var(--hover-bg)] text-[var(--foreground)] shadow-sm' : ''} ${isCollapsed ? 'lg:justify-center' : ''}`}>
            <Users className="w-4 h-4 shrink-0" />
            <span className={`truncate ${isCollapsed ? 'lg:hidden' : ''}`}>{t('sidebar.clients')}</span>
          </Link>
          <Link href="/invoices" onClick={onClose} className={`py-2 px-3 rounded-lg hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)] transition-all flex items-center gap-2.5 cursor-pointer hover:scale-[1.02] ${pathname.startsWith('/invoices') ? 'bg-[var(--hover-bg)] text-[var(--foreground)] shadow-sm' : ''} ${isCollapsed ? 'lg:justify-center' : ''}`}>
            <FileText className="w-4 h-4 shrink-0" />
            <span className={`truncate ${isCollapsed ? 'lg:hidden' : ''}`}>{t('sidebar.invoices')}</span>
          </Link>

          <div className="mt-8 flex flex-col gap-1.5 font-bold">
            <div className={`text-[10px] font-black text-[var(--muted)] px-3 mb-2 uppercase tracking-[0.2em] opacity-70 italic truncate ${isCollapsed ? 'lg:hidden' : ''}`}>
              {t('sidebar.settings')}
            </div>
            <Link href="/settings" onClick={onClose} className={`py-2 px-3 rounded-lg hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)] transition-all flex items-center gap-2.5 cursor-pointer hover:scale-[1.02] ${pathname === '/settings' ? 'bg-[var(--hover-bg)] text-[var(--foreground)] shadow-sm' : ''} ${isCollapsed ? 'lg:justify-center' : ''}`}>
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className={`truncate ${isCollapsed ? 'lg:hidden' : ''}`}>{t('sidebar.settings')}</span>
            </Link>
          </div>
        </nav>

        <div className="mt-4 px-1 space-y-3">
          {/* Plan Info */}
          <div 
            className={`p-3 bg-[var(--hover-bg)] rounded-xl border border-[var(--border)] group cursor-pointer hover:border-blue-500/30 transition-all hover:scale-[1.02] shadow-sm ${isCollapsed ? 'lg:flex lg:justify-center' : ''}`} 
            onClick={() => setIsUpgradePopupOpen(true)}
          >
            <Sparkles className={`w-5 h-5 text-blue-500 animate-pulse hidden ${isCollapsed ? 'lg:block' : ''}`} />
            
            <div className={`flex flex-col ${isCollapsed ? 'lg:hidden' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] flex items-center gap-1.5 truncate">
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  {t('sidebar.freePlan')}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0"></div>
              </div>
              <p className="text-[10px] text-[var(--muted)] font-bold truncate">{t('sidebar.workspaceLimit')}</p>
            </div>
          </div>

          <div className="space-y-1 pb-2">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className={`flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[var(--hover-bg)] transition-all cursor-pointer hover:scale-[1.02] text-[var(--muted)] hover:text-[var(--foreground)] text-[12px] w-full font-bold group ${isCollapsed ? 'lg:justify-center' : ''}`}
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-orange-400 shrink-0 group-hover:rotate-90 transition-transform duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-blue-500 shrink-0 group-hover:-rotate-12 transition-transform duration-300" />
              )}
              <span className={`flex-1 text-left uppercase tracking-widest truncate ${isCollapsed ? 'lg:hidden' : ''}`}>
                {theme === 'dark' ? t('settings.light') : t('settings.dark')}
              </span>
            </button>

            {/* Logout Button */}
            <button 
              onClick={() => setIsLogoutPopupOpen(true)} 
              className={`flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-red-500/10 transition-all cursor-pointer hover:scale-[1.02] text-[var(--muted)] hover:text-red-500 text-[12px] w-full font-bold group ${isCollapsed ? 'lg:justify-center' : ''}`}
              title="Logout"
            >
              <LogOut className="w-4 h-4 shrink-0 group-hover:-translate-x-1 transition-transform" />
              <span className={`flex-1 text-left uppercase tracking-widest truncate ${isCollapsed ? 'lg:hidden' : ''}`}>
                {t('common.logout')}
              </span>
            </button>
          </div>
        </div>
      </aside>

      <ConfirmDialog 
        isOpen={isUpgradePopupOpen}
        onClose={() => setIsUpgradePopupOpen(false)}
        onConfirm={() => {
          router.push('/pricing');
          if (onClose) onClose();
        }}
        title="Upgrade Workspace"
        message="Do you want to see the Pro plans to upgrade your workspace?"
        confirmText="View Plans"
        type="info"
      />

      <ConfirmDialog 
        isOpen={isLogoutPopupOpen}
        onClose={() => setIsLogoutPopupOpen(false)}
        onConfirm={handleLogout}
        title="Logout"
        message={`Are you sure you want to ${t('common.logout').toLowerCase()}?`}
        confirmText={t('common.logout')}
        type="danger"
      />
    </>
  );
}

