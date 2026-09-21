'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Badge,
  Button,
  Input,
  Spinner,
  Alert,
  Dialog,
} from '@legalhub/ui';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../../../lib/auth/context';
import { Navbar } from '../../../../components/layout/navbar';
import { Footer } from '../../../../components/layout/footer';
import { AdminPortalNav } from '../../../../components/admin/admin-portal-nav';
import { AdminGuard } from '../../../../components/admin/admin-guard';
import { getAdminUsers, toggleBlockUser } from '../../../../lib/services/admin-portal.service';
import type { AdminUserItem, UserRole, UserStatus } from '@legalhub/types';
import { formatDate } from '@legalhub/utils';

export default function AdminUsersPage() {
  const { user, role } = useAuth();
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');

  // Block/Unblock Modal State
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [actionType, setActionType] = useState<'block' | 'unblock'>('block');
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await getAdminUsers(role || 'admin', {
        role: roleFilter,
        status: statusFilter,
        searchQuery: searchQuery.trim() || undefined,
      });
      if (res.success) setUsers(res.users);
    } catch {
      setErrorMessage('Failed to load user accounts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [role, roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleToggleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !user) return;

    setActionLoading(true);
    setErrorMessage(null);

    try {
      const res = await toggleBlockUser(
        user.uid,
        role,
        selectedUser.uid,
        actionType,
        reason.trim()
      );

      if (res.success && res.user) {
        setSuccessMessage(
          `User ${selectedUser.fullName || selectedUser.email} has been ${
            actionType === 'block' ? 'suspended' : 'restored'
          }. Audit log recorded.`
        );
        setUsers((prev) =>
          prev.map((u) =>
            u.uid === selectedUser.uid ? { ...u, status: res.user!.status } : u
          )
        );
        setSelectedUser(null);
        setReason('');
      } else {
        setErrorMessage(res.error || 'Failed to modify user status');
      }
    } catch {
      setErrorMessage('Error modifying user account status');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <AdminPortalNav />

      <main className="py-8">
        <Container className="max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                User Account Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Inspect registered property clients, advocate accounts, and enforce compliance suspensions.
              </p>
            </div>
          </div>

          {successMessage && (
            <Alert variant="success" className="mb-6">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              <span>{successMessage}</span>
            </Alert>
          )}

          {errorMessage && (
            <Alert variant="error" className="mb-6">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{errorMessage}</span>
            </Alert>
          )}

          {/* Filters & Search */}
          <Card className="border-slate-200 bg-white shadow-xs mb-6">
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Role Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {(['all', 'client', 'lawyer', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRoleFilter(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-colors ${
                        roleFilter === r
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {r === 'all' ? 'All Roles' : r}
                    </button>
                  ))}
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-1.5">
                  {(['all', 'active', 'suspended'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                        statusFilter === s
                          ? 'bg-blue-700 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {s === 'all' ? 'All Status' : s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search input */}
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name, email, phone, or UID..."
                    className="pl-9 text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="primary" size="sm" className="text-xs">
                  Filter
                </Button>
                {searchQuery && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setSearchQuery('');
                      loadUsers();
                    }}
                  >
                    Clear
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Users Table */}
          {isLoading ? (
            <div className="py-20 text-center">
              <Spinner size="lg" className="mx-auto text-blue-700" />
              <p className="text-xs text-slate-500 mt-2">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <Card className="border-slate-200 bg-white p-12 text-center">
              <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900">No users found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No user accounts match your search filter criteria.
              </p>
            </Card>
          ) : (
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase font-semibold text-slate-500">
                      <tr>
                        <th className="p-4">User Details</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center">Bookings</th>
                        <th className="p-4">Registered</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u) => {
                        const isSuspended = u.status === 'suspended';
                        return (
                          <tr key={u.uid} className="hover:bg-slate-50/50">
                            <td className="p-4">
                              <div className="font-bold text-slate-900">{u.fullName || 'Unnamed User'}</div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                {u.email && <span>{u.email}</span>}
                                {u.phoneNumber && <span>• {u.phoneNumber}</span>}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono block">
                                UID: {u.uid}
                              </span>
                            </td>

                            <td className="p-4">
                              <Badge
                                variant={
                                  u.role === 'lawyer'
                                    ? 'navy'
                                    : u.role === 'admin' || u.role === 'super_admin'
                                    ? 'warning'
                                    : 'outline'
                                }
                                className="uppercase text-[10px]"
                              >
                                {u.role}
                              </Badge>
                            </td>

                            <td className="p-4">
                              <Badge
                                variant={isSuspended ? 'error' : 'navy'}
                                className={isSuspended ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}
                              >
                                {u.status || 'active'}
                              </Badge>
                            </td>

                            <td className="p-4 text-center font-bold text-slate-800">
                              {u.totalBookingsCount}
                            </td>

                            <td className="p-4 text-slate-500">
                              {u.createdAt ? formatDate(u.createdAt) : 'N/A'}
                            </td>

                            <td className="p-4 text-right">
                              {u.role !== 'super_admin' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={`text-xs ${
                                    isSuspended
                                      ? 'text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                                      : 'text-red-600 hover:bg-red-50 border-red-200'
                                  }`}
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setActionType(isSuspended ? 'unblock' : 'block');
                                  }}
                                  leftIcon={isSuspended ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                                >
                                  {isSuspended ? 'Unblock' : 'Block'}
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Block / Unblock Confirmation Modal */}
          <Dialog
            isOpen={!!selectedUser}
            onClose={() => setSelectedUser(null)}
            title={`${actionType === 'block' ? 'Suspend' : 'Unblock'} User Account`}
          >
            {selectedUser && (
              <form onSubmit={handleToggleBlockSubmit} className="space-y-4">
                <p className="text-xs text-slate-600">
                  Are you sure you want to {actionType} the account for{' '}
                  <strong>{selectedUser.fullName || selectedUser.email}</strong> (Role:{' '}
                  {selectedUser.role.toUpperCase()})?
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Privileged Action Justification / Reason (Min 5 chars) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="State reason for suspension or restoration..."
                    className="w-full rounded-md border border-slate-300 p-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    This reason will be recorded immutably in the system audit logs.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={actionLoading}
                    className={
                      actionType === 'block'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }
                  >
                    Confirm {actionType === 'block' ? 'Suspension' : 'Unblock'}
                  </Button>
                </div>
              </form>
            )}
          </Dialog>
        </Container>
      </main>

        <Footer />
      </div>
    </AdminGuard>
  );
}
