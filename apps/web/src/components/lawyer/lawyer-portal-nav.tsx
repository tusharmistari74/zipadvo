'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Calendar,
  FileText,
  IndianRupee,
  User,
  ShieldCheck,
  Bell,
  Settings,
} from 'lucide-react';
import { Badge } from '@legalhub/ui';

interface LawyerPortalNavProps {
  pendingCount?: number;
  unreadNotifsCount?: number;
}

export function LawyerPortalNav({ pendingCount = 0, unreadNotifsCount = 0 }: LawyerPortalNavProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/lawyer', icon: LayoutDashboard, exact: true },
    {
      label: 'Bookings',
      href: '/lawyer/bookings',
      icon: CalendarDays,
      badge: pendingCount > 0 ? `${pendingCount} pending` : undefined,
      badgeVariant: 'warning' as const,
    },
    { label: 'Calendar', href: '/lawyer/calendar', icon: Calendar },
    { label: 'Documents', href: '/lawyer/documents', icon: FileText },
    { label: 'Earnings', href: '/lawyer/earnings', icon: IndianRupee },
    { label: 'Profile', href: '/lawyer/profile', icon: User },
    { label: 'KYC Status', href: '/lawyer/kyc', icon: ShieldCheck },
    {
      label: 'Notifications',
      href: '/lawyer/notifications',
      icon: Bell,
      badge: unreadNotifsCount > 0 ? String(unreadNotifsCount) : undefined,
      badgeVariant: 'navy' as const,
    },
    { label: 'Settings', href: '/lawyer/settings', icon: Settings },
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
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <Badge
                    variant={item.badgeVariant}
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
