'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Container,
  Button,
  Input,
  Card,
  CardContent,
  Badge,
  StatusBadge,
  Spinner,
} from '@legalhub/ui';
import {
  ShieldCheck,
  Search,
  Scale,
  Clock,
  XCircle,
  ArrowRight,
  User,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../../../lib/auth/context';
import { Navbar } from '../../../../components/layout/navbar';
import { Footer } from '../../../../components/layout/footer';
import { AdminGuard } from '../../../../components/admin/admin-guard';
import {
  listAdminLawyers,
  type AdminLawyerListItem,
  type AdminLawyerFilter,
} from '../../../../lib/services/admin-lawyer.service';
import { mumbaiCourtsEnum } from '@legalhub/validation';

export default function AdminLawyersListPage() {
  const { role, isAuthenticated, isLoading: authLoading } = useAuth();

  const [lawyers, setLawyers] = useState<AdminLawyerListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'verified' | 'rejected' | 'suspended'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourt, setSelectedCourt] = useState('all');

  const isAdmin = role === 'admin' || role === 'super_admin';

  // Load Lawyers
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      setIsLoading(false);
      return;
    }

    async function fetchLawyers() {
      setIsLoading(true);
      try {
        const filter: AdminLawyerFilter = {
          status: activeTab,
          searchQuery,
          court: selectedCourt,
        };
        const data = await listAdminLawyers(filter);
        setLawyers(data);
      } catch (err) {
        console.error('Failed to load admin lawyers:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLawyers();
  }, [isAuthenticated, isAdmin, activeTab, searchQuery, selectedCourt]);

  // Metric summaries
  const metrics = useMemo(() => {
    return {
      total: lawyers.length,
      pending: lawyers.filter((l) => l.kycStatus === 'submitted' || l.kycStatus === 'under_review').length,
      verified: lawyers.filter((l) => l.kycStatus === 'verified').length,
      rejected: lawyers.filter((l) => l.kycStatus === 'rejected').length,
      suspended: lawyers.filter((l) => l.kycStatus === 'suspended').length,
    };
  }, [lawyers]);

  if (authLoading || isLoading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <Container className="py-24 text-center">
            <Spinner size="lg" className="mx-auto text-blue-700" />
            <p className="text-sm text-slate-600 mt-4">Loading verification queue...</p>
          </Container>
          <Footer />
        </div>
      </AdminGuard>
    );
  }

  // 403 Forbidden if not Admin
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <Container className="py-20 max-w-md">
          <Card className="border-rose-200 bg-white shadow-md text-center p-8 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-slate-900">403 - Restricted Access</h1>
            <p className="text-xs sm:text-sm text-slate-600">
              The Lawyer Verification Center requires Administrator privileges. Your current role is not authorized.
            </p>
            <div className="pt-2">
              <Link href="/">
                <Button variant="primary" fullWidth>
                  Return to Homepage
                </Button>
              </Link>
            </div>
          </Card>
        </Container>
        <Footer />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    return <StatusBadge status={status} />;
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="py-8 sm:py-12">
        <Container>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="navy" className="bg-slate-900 text-white">
                  Admin Verification Center
                </Badge>
                <span className="text-xs text-slate-500 font-mono">BCMG Compliance</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                Lawyer Sanad & KYC Verification Roster
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Review bar enrollment credentials, inspect private KYC documents, and manage advocate status.
              </p>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Total In Queue
                  </span>
                  <span className="text-2xl font-bold text-slate-900">{metrics.total}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700">
                  <User className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/40 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                    Pending Action
                  </span>
                  <span className="text-2xl font-bold text-amber-950">{metrics.pending}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-100 text-amber-800">
                  <Clock className="h-5 w-5 animate-pulse" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50/40 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Verified Active
                  </span>
                  <span className="text-2xl font-bold text-emerald-950">{metrics.verified}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Rejected / Blocked
                  </span>
                  <span className="text-2xl font-bold text-slate-900">
                    {metrics.rejected + metrics.suspended}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700">
                  <XCircle className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filters Row */}
          <Card className="border-slate-200 bg-white shadow-xs mb-6">
            <CardContent className="p-4 space-y-4">
              {/* Tab selector */}
              <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3">
                {[
                  { key: 'pending', label: 'Pending Review' },
                  { key: 'verified', label: 'Verified Active' },
                  { key: 'rejected', label: 'Rejected' },
                  { key: 'suspended', label: 'Suspended' },
                  { key: 'all', label: 'All Applications' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === tab.key
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search & Dropdown Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <Input
                    placeholder="Search by advocate name, Sanad number (MAH/XXXX/YYYY), or locality..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="h-4 w-4 text-slate-400" />}
                  />
                </div>

                <div className="sm:col-span-4">
                  <select
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-600 focus:outline-none"
                    value={selectedCourt}
                    onChange={(e) => setSelectedCourt(e.target.value)}
                  >
                    <option value="all">All Mumbai Courts</option>
                    {mumbaiCourtsEnum.options.map((court) => (
                      <option key={court} value={court}>
                        {court}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lawyers Table / List */}
          <Card className="border-slate-200 bg-white shadow-md overflow-hidden">
            {lawyers.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Scale className="h-10 w-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No Applications Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No lawyer applications match your selected filter criteria or search query.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveTab('all');
                    setSearchQuery('');
                    setSelectedCourt('all');
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-4">Advocate</th>
                      <th className="p-4">Sanad & Enrollment</th>
                      <th className="p-4">Primary Court</th>
                      <th className="p-4">Practice & Locality</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {lawyers.map((lawyer) => (
                      <tr key={lawyer.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{lawyer.fullName}</div>
                          <span className="text-[11px] text-slate-500 block">
                            {lawyer.experienceYears} Years Practice
                          </span>
                        </td>
                        <td className="p-4 font-mono">
                          <span className="font-bold text-blue-800 block">{lawyer.sanadNumber}</span>
                          <span className="text-[10px] text-slate-500 font-sans">
                            Enrolled {lawyer.enrollmentYear}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-800 font-medium">{lawyer.primaryCourt}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-800">{lawyer.locality}</div>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {lawyer.practiceAreas.slice(0, 2).map((area, i) => (
                              <span
                                key={i}
                                className="inline-block bg-slate-100 text-[10px] px-1.5 py-0.5 rounded text-slate-600 truncate max-w-[120px]"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">{getStatusBadge(lawyer.kycStatus)}</td>
                        <td className="p-4 text-right">
                          <Link href={`/admin/lawyers/${lawyer.id}`}>
                            <Button
                              variant={
                                lawyer.kycStatus === 'submitted' || lawyer.kycStatus === 'under_review'
                                  ? 'primary'
                                  : 'outline'
                              }
                              size="sm"
                              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                            >
                              Review
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
