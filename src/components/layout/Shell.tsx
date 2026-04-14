'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import MobileHeader from '@/components/ui/MobileHeader';

export default function Shell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isPublicRoute = pathname === '/' || pathname === '/login' || pathname === '/signup' || pathname === '/register';

  if (isPublicRoute) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full relative print:block print:min-h-0 print:bg-white">
      <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 min-h-screen transition-all duration-300 print:min-h-0 print:bg-white" style={{ minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
