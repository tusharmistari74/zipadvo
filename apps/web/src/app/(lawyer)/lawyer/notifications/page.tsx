'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Container,
  Card,
  Button,
  Spinner,
  Alert,
} from '@legalhub/ui';
import {
  Bell,
  CheckCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../../../lib/auth/context';
import { Navbar } from '../../../../components/layout/navbar';
import { Footer } from '../../../../components/layout/footer';
import { LawyerPortalNav } from '../../../../components/lawyer/lawyer-portal-nav';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../../../lib/services/notifications/notification.service';
import type { AppNotification } from '@legalhub/types';
import { formatDate } from '@legalhub/utils';

export default function LawyerNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const lawyerUid = user?.uid || 'lawyer-1';

  const loadNotifications = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await getUserNotifications(lawyerUid, lawyerUid, {
        unreadOnly,
        limit: 50,
      });
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch {
      setErrorMessage('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [lawyerUid, unreadOnly]);

  const handleMarkRead = async (id: string) => {
    await markNotificationAsRead(id, lawyerUid);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead(lawyerUid);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead && !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <LawyerPortalNav unreadNotifsCount={unreadCount} />

      <main className="py-8">
        <Container className="max-w-4xl">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                Advocate Notifications Inbox
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                New consultation requests, client document uploads, KYC verification updates, and fee settlements.
              </p>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                leftIcon={<CheckCheck className="h-4 w-4" />}
                className="text-xs"
              >
                Mark all as read
              </Button>
            )}
          </div>

          {errorMessage && (
            <Alert variant="error" className="mb-6">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{errorMessage}</span>
            </Alert>
          )}

          {/* Filter Pills */}
          <div className="flex items-center gap-2 mb-6">
            <button
              type="button"
              onClick={() => setUnreadOnly(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                !unreadOnly
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setUnreadOnly(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                unreadOnly
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Unread Only ({unreadCount})
            </button>
          </div>

          {/* Feed List */}
          {isLoading ? (
            <div className="py-20 text-center">
              <Spinner size="lg" className="mx-auto text-blue-700" />
              <p className="text-xs text-slate-500 mt-2">Loading alerts...</p>
            </div>
          ) : notifications.length === 0 ? (
            <Card className="border-slate-200 bg-white p-12 text-center">
              <Bell className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900">No notifications</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {unreadOnly ? 'You have caught up with all alerts.' : 'No notification history recorded yet.'}
              </p>
            </Card>
          ) : (
            <Card className="border-slate-200 bg-white shadow-xs divide-y divide-slate-100">
              {notifications.map((notif) => {
                const isUnread = !notif.isRead && !notif.read;
                return (
                  <div
                    key={notif.id}
                    className={`p-4 sm:p-5 transition-colors flex items-start gap-4 ${
                      isUnread ? 'bg-blue-50/30' : 'bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0 mt-0.5">
                      <Bell className="h-4 w-4" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-xs font-bold ${isUnread ? 'text-blue-950' : 'text-slate-900'}`}>
                            {notif.title}
                          </h4>
                          {isUnread && (
                            <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {formatDate(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {notif.body || notif.message}
                      </p>

                      <div className="pt-2 flex items-center justify-between text-xs">
                        {notif.actionUrl ? (
                          <Link
                            href={notif.actionUrl}
                            className="font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 text-[11px]"
                          >
                            Open Link <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : <div />}

                        {isUnread && (
                          <button
                            type="button"
                            onClick={() => handleMarkRead(notif.id)}
                            className="text-[11px] text-slate-500 hover:text-slate-800"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}
