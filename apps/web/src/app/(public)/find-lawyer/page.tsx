'use client';

import React, { useState, useMemo, useTransition } from 'react';
import dynamic from 'next/dynamic';
import {
  Container,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Rating,
  Avatar,
  Input,
  Select,
  Breadcrumb,
} from '@legalhub/ui';
import { Navbar } from '../../../components/layout/navbar';
import { Footer } from '../../../components/layout/footer';
import { usePlatformSettings } from '../../../lib/hooks/use-platform-settings';
import { Search, MapPin, Scale, ShieldCheck, Map, List, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import type { LawyerMarkerItem } from '../../../components/map/mumbai-lawyer-map';

// Dynamic lazy import for Map component to isolate bundle and prevent hydration delays
const MumbaiLawyerMap = dynamic(
  () =>
    import('../../../components/map/mumbai-lawyer-map').then(
      (mod) => mod.MumbaiLawyerMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[380px] w-full animate-pulse rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-xs">
        Loading Mumbai Jurisdiction Map...
      </div>
    ),
  }
);

const PAGE_SIZE = 5;

const LAWYERS_CATALOG: LawyerMarkerItem[] = [
  {
    id: 'adv_rajesh_mehta',
    name: 'Adv. Rajesh Mehta',
    title: 'Senior Property Conveyancing & Title Advocate',
    sanad: 'MAH/4521/2012',
    court: 'Bombay High Court & City Civil (Fort)',
    experience: 14,
    rating: 4.9,
    reviewCount: 62,
    location: 'South Mumbai & BKC',
    region: 'south',
    practice: 'title',
    lat: 18.9298,
    lng: 72.8335,
    specialties: [
      'Title Verification & Due Diligence',
      'Society Redevelopment',
      'Sale Deed Drafting',
    ],
    consultationFee: 299,
  },
  {
    id: 'adv_priya_deshmukh',
    name: 'Adv. Priya Deshmukh',
    title: 'Advocate & MahaRERA Consultant',
    sanad: 'MAH/1982/2016',
    court: 'MahaRERA Tribunal & Bandra Court',
    experience: 9,
    rating: 4.8,
    reviewCount: 47,
    location: 'Western Suburbs (Bandra / Andheri)',
    region: 'western',
    practice: 'rera',
    lat: 19.0596,
    lng: 72.8295,
    specialties: [
      'RERA Builder Delays',
      'Index-2 Registration',
      'Lease Agreements',
    ],
    consultationFee: 299,
  },
  {
    id: 'adv_vikram_joshi',
    name: 'Adv. Vikram Joshi',
    title: 'Property Litigation & Conveyance Specialist',
    sanad: 'MAH/3104/2014',
    court: 'Dindoshi Court & Borivali Court',
    experience: 11,
    rating: 4.9,
    reviewCount: 53,
    location: 'Western Suburbs (Goregaon / Borivali)',
    region: 'western',
    practice: 'registration',
    lat: 19.1663,
    lng: 72.8526,
    specialties: [
      'Deemed Conveyance',
      '7/12 Mutation',
      'Gift & Succession Deeds',
    ],
    consultationFee: 299,
  },
  {
    id: 'adv_ananya_sharma',
    name: 'Adv. Ananya Sharma',
    title: 'Commercial Conveyancing & Stamp Duty Counsel',
    sanad: 'MAH/2289/2015',
    court: 'Bombay High Court & Kurla Court',
    experience: 10,
    rating: 4.7,
    reviewCount: 39,
    location: 'Eastern Suburbs (Ghatkopar / Chembur)',
    region: 'eastern',
    practice: 'registration',
    lat: 19.086,
    lng: 72.908,
    specialties: [
      'Stamp Duty Appeals',
      'Commercial Lease',
      'Title Search',
    ],
    consultationFee: 299,
  },
  {
    id: 'adv_sanjay_patil',
    name: 'Adv. Sanjay Patil',
    title: 'Society Redevelopment & Land Revenue Advocate',
    sanad: 'MAH/0943/2009',
    court: 'Thane District Court & Bombay High Court',
    experience: 16,
    rating: 4.9,
    reviewCount: 78,
    location: 'Thane & Navi Mumbai',
    region: 'thane',
    practice: 'society',
    lat: 19.2183,
    lng: 72.9781,
    specialties: [
      'Co-op Housing Society Disputes',
      '7/12 Extract Correction',
      'Conveyance Deeds',
    ],
    consultationFee: 299,
  },
];

export default function FindLawyerPage() {
  const { unlockFee } = usePlatformSettings();
  const [selectedPractice, setSelectedPractice] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMap, setShowMap] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [, startTransition] = useTransition();

  // Memoized filtered roster to prevent costly recalculations during typing
  const filteredLawyers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return LAWYERS_CATALOG.filter((lawyer) => {
      const matchesPractice =
        selectedPractice === 'all' || lawyer.practice === selectedPractice;
      const matchesRegion =
        selectedRegion === 'all' || lawyer.region === selectedRegion;
      const matchesSearch =
        q === '' ||
        lawyer.name.toLowerCase().includes(q) ||
        lawyer.specialties.some((s) => s.toLowerCase().includes(q)) ||
        lawyer.location.toLowerCase().includes(q);

      return matchesPractice && matchesRegion && matchesSearch;
    });
  }, [selectedPractice, selectedRegion, searchQuery]);

  // Paginated visible slice
  const paginatedLawyers = useMemo(() => {
    return filteredLawyers.slice(0, visibleCount);
  }, [filteredLawyers, visibleCount]);

  const hasMore = visibleCount < filteredLawyers.length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    startTransition(() => {
      setSearchQuery(val);
      setVisibleCount(PAGE_SIZE);
    });
  };

  const handlePracticeChange = (val: string) => {
    setSelectedPractice(val);
    setVisibleCount(PAGE_SIZE);
  };

  const handleRegionChange = (val: string) => {
    setSelectedRegion(val);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      {/* Header & Search */}
      <section className="bg-slate-900 text-white py-10 border-b border-slate-800">
        <Container className="space-y-4">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Find a Lawyer', isCurrent: true },
            ]}
          />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold">
                Find Verified Mumbai Property Lawyers
              </h1>
              <p className="text-sm text-slate-300 mt-1">
                Browse Bar Council of Maharashtra & Goa accredited advocates across Mumbai courts.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={showMap ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setShowMap(!showMap)}
                leftIcon={showMap ? <List className="h-4 w-4" /> : <Map className="h-4 w-4" />}
              >
                {showMap ? 'Hide Map' : 'Show Map'}
              </Button>
              <div className="inline-flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300">
                <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0" />
                <span>Fixed ₹{unlockFee} Unlock Fee</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-8 flex-1">
        <Container className="space-y-8">
          {/* Interactive Lazy-Loaded Map View */}
          {showMap && (
            <div className="transition-all duration-300">
              <MumbaiLawyerMap
                lawyers={LAWYERS_CATALOG}
                selectedRegion={selectedRegion}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="sticky top-20 border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold">Search Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Keyword Search
                    </label>
                    <Input
                      placeholder="e.g. Bandra, Title, RERA"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      leftIcon={<Search className="h-4 w-4" />}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Legal Practice Area
                    </label>
                    <Select
                      value={selectedPractice}
                      onChange={(e) => handlePracticeChange(e.target.value)}
                      options={[
                        { value: 'all', label: 'All Practice Areas' },
                        { value: 'title', label: 'Title Verification & 7/12' },
                        { value: 'registration', label: 'Property Registration & Deeds' },
                        { value: 'rera', label: 'MahaRERA Disputes' },
                        { value: 'society', label: 'Housing Society Redevelopment' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Mumbai Region
                    </label>
                    <Select
                      value={selectedRegion}
                      onChange={(e) => handleRegionChange(e.target.value)}
                      options={[
                        { value: 'all', label: 'All Mumbai Regions' },
                        { value: 'south', label: 'South Mumbai (Fort / Colaba)' },
                        { value: 'western', label: 'Western Suburbs (Bandra - Borivali)' },
                        { value: 'eastern', label: 'Eastern Suburbs (Ghatkopar - Mulund)' },
                        { value: 'thane', label: 'Thane & Navi Mumbai' },
                      ]}
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setSelectedPractice('all');
                      setSelectedRegion('all');
                      setSearchQuery('');
                      setVisibleCount(PAGE_SIZE);
                    }}
                  >
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Lawyers List with Virtualized / Paginated Feed */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <p className="text-sm font-semibold text-slate-700">
                  Showing <span className="text-slate-900 font-bold">{paginatedLawyers.length}</span> of{' '}
                  <span className="text-slate-900 font-bold">{filteredLawyers.length}</span> verified advocates
                </p>
              </div>

              {paginatedLawyers.length === 0 ? (
                <Card className="p-8 text-center border-dashed border-slate-300">
                  <p className="text-sm text-slate-500">No verified advocates found matching your filter criteria.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setSelectedPractice('all');
                      setSelectedRegion('all');
                      setSearchQuery('');
                    }}
                  >
                    Clear Filters
                  </Button>
                </Card>
              ) : (
                paginatedLawyers.map((lawyer) => (
                  <Card
                    key={lawyer.id}
                    className="border-slate-200 hover:border-blue-300 transition-all shadow-xs"
                  >
                    <div className="p-6 flex flex-col sm:flex-row items-start justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <Avatar name={lawyer.name} size="xl" status="online" className="mt-1" />
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-serif text-lg font-bold text-slate-900">{lawyer.name}</h3>
                            <Badge variant="success" size="sm">
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                            <span className="text-xs font-mono text-slate-500">Sanad: {lawyer.sanad}</span>
                          </div>

                          <p className="text-sm font-medium text-slate-700">{lawyer.title}</p>

                          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600 pt-1">
                            <span className="flex items-center gap-1">
                              <Scale className="h-3.5 w-3.5 text-slate-400" />
                              {lawyer.court}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" />
                              {lawyer.location}
                            </span>
                            <span>• {lawyer.experience} yrs exp</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {lawyer.specialties.map((spec, i) => (
                              <span
                                key={i}
                                className="inline-block bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-0.5 rounded-md"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Panel */}
                      <div className="flex flex-col items-end justify-between self-stretch sm:border-l sm:border-slate-100 sm:pl-6 space-y-3 shrink-0">
                        <div className="text-right">
                          <Rating value={lawyer.rating} reviewCount={lawyer.reviewCount} showText size="sm" />
                          <p className="text-xs text-slate-500 mt-1 font-medium">Unlock Fee: ₹{unlockFee}</p>
                        </div>

                        <Link href={`/lawyers/${lawyer.id}`}>
                          <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                            View Profile & Book
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))
              )}

              {/* Load More Pagination Trigger */}
              {hasMore && (
                <div className="pt-4 text-center">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                    leftIcon={<ChevronDown className="h-4 w-4" />}
                  >
                    Load More Advocates
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
}
