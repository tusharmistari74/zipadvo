'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  Calendar,
  CreditCard,
  FileText,
  ShieldCheck,
  AlertCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@legalhub/ui';
import { useAuth } from '../../lib/auth/context';
import type { AppNotification, NotificationType } from '@legalhub/types';
import { formatDate } from '@legalhub/utils';

export function NotificationBell() {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    if (!isAuthenticated || !user?.uid) return;

    try {
      const res = await fetch(`/api/notifications?userId=${user.uid}&limit=10`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Offline/fallback
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [user?.uid, isAuthenticated]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user?.uid) return;
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Ignored
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.uid) return;
    setIsLoading(true);
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
      setUnreadCount(0);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  const renderEventIcon = (type: NotificationType) => {
    switch (type) {
      case 'BOOKING_CREATED':
      case 'LAWYER_ACCEPTED':
      case 'APPOINTMENT_REMINDER':
      case 'booking_requested':
      case 'booking_accepted':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'PAYMENT_SUCCESS':
      case 'REFUND_PROCESSED':
      case 'payment_received':
        return <CreditCard className="h-4 w-4 text-emerald-600" />;
      case 'DOCUMENT_UPLOADED':
      case 'DOCUMENT_READY':
        return <FileText className="h-4 w-4 text-purple-600" />;
      case 'KYC_SUBMITTED':
      case 'KYC_APPROVED':
      case 'KYC_REJECTED':
      case 'kyc_approved':
      case 'kyc_rejected':
        return <ShieldCheck className="h-4 w-4 text-amber-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-xs animate-in zoom-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="navy" className="text-[10px] py-0 px-1.5">
                  {unreadCount} new
                </Badge>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={isLoading}
                className="text-[11px] font-medium text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Feed List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <Bell className="h-7 w-7 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium">No notifications yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Updates on appointments, document reviews, and payments will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !notif.isRead && !notif.read;
                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 transition-colors ${
                      isUnread ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                        {renderEventIcon(notif.type)}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <p className={`text-xs font-bold ${isUnread ? 'text-blue-950' : 'text-slate-800'}`}>
                            {notif.title}
                          </p>
                          {isUnread && (
                            <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                          )}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {notif.body || notif.message}
                        </p>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(notif.createdAt)}
                          </span>

                          <div className="flex items-center gap-2">
                            {notif.actionUrl && (
                              <Link
                                href={notif.actionUrl}
                                onClick={() => {
                                  if (isUnread) handleMarkAsRead(notif.id);
                                  setIsOpen(false);
                                }}
                                className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-0.5"
                              >
                                View <ExternalLink className="h-2.5 w-2.5" />
                              </Link>
                            )}

                            {isUnread && (
                              <button
                                type="button"
                                onClick={() => handleMarkAsRead(notif.id)}
                                className="text-[10px] text-slate-500 hover:text-slate-800"
                              >
                                Dismiss
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer link to Dashboard Notifications Tab */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <Link
              href="/dashboard?tab=notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 block"
            >
              View all in Notifications Inbox →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
