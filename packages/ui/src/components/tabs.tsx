'use client';

import React, { createContext, useContext } from 'react';
import { cn } from '@legalhub/utils';

interface TabsContextType {
  activeTab: string;
  onChange: (tabId: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export interface TabsProps {
  activeTab: string;
  onChange: (tabId: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ activeTab, onChange, children, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ activeTab, onChange }}>
      <div className={cn('w-full space-y-4', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center justify-start rounded-lg bg-slate-100 p-1 text-slate-500 border border-slate-200/60',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be within Tabs');

  const isActive = context.activeTab === value;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      onClick={() => context.onChange(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3.5 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 select-none cursor-pointer',
        isActive
          ? 'bg-white text-slate-900 shadow-xs font-semibold'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be within Tabs');

  if (context.activeTab !== value) return null;

  return (
    <div role="tabpanel" className={cn('focus-visible:outline-none animate-in fade-in-50 duration-150', className)}>
      {children}
    </div>
  );
}
