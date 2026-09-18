'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CalendarDays,
  CreditCard,
  AlertTriangle,
  Settings,
  History,
  BarChart3,
} from 'lucide-react';
import { Badge } from '@legalhub/ui';

interface AdminPortalNavProps {
  pendingKycCount?: number;
  activeDisputesCount?: number;
}

export function AdminPortalNav({ pendingKycCount = 0, activeDisputesCount = 0 }: AdminPortalNavProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Users', href: '/admin/users', icon: Users },
    {
      label: 'Advocate Verification',
      href: '/admin/lawyers',
      icon: ShieldCheck,
      badge: pendingKycCount > 0 ? `${pendingKycCount} pending` : undefined,
      badgeVariant: 'warning' as const,
    },
    { label: 'Bookings & Overrides', href: '/admin/bookings', icon: CalendarDays },
    { label: 'Payments & Refunds', href: '/admin/payments', icon: CreditCard },
    {
      label: 'Disputes',
      href: '/admin/disputes',
      icon: AlertTriangle,
      badge: activeDisputesCount > 0 ? `${activeDisputesCount} active` : undefined,
      badgeVariant: 'error' as const,
    },
    { label: 'Platform Settings', href: '/admin/settings', icon: Settings },
    { label: 'Audit Trail', href: '/admin/audit-logs', icon: History },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-2 gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <Badge
                    variant={item.badgeVariant || 'default'}
                    className="text-[10px] py-0 px-1.5 ml-0.5"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
