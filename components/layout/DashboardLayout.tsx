'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AuthGuard } from './AuthGuard';
import { CommandSearch } from '@/components/shared/CommandSearch';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/lib/utils';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarMobileOpen, setMobileSidebarOpen } = useUIStore();

  return (
    <AuthGuard>
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarMobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Sidebar desktop */}
      <div className="hidden lg:flex h-full">
        <Sidebar />
      </div>

      {/* Sidebar mobile */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-40 flex lg:hidden transition-transform duration-200',
        sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <Sidebar />
      </div>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      <CommandSearch />
    </div>
    </AuthGuard>
  );
}
