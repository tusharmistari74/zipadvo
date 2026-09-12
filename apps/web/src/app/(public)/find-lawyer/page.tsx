'use client';

import React, { useState } from 'react';
import { Container, Button, Card, CardHeader, CardTitle, CardContent, Badge, Rating, Avatar, Input, Select, Breadcrumb } from '@legalhub/ui';
import { Navbar } from '../../../components/layout/navbar';
import { Footer } from '../../../components/layout/footer';
import { Search, MapPin, Scale, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function FindLawyerPage() {
  const [selectedPractice, setSelectedPractice] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const lawyersCatalog = [
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
      languages: ['English', 'Marathi', 'Hindi', 'Gujarati'],
      specialties: ['Title Verification & Due Diligence', 'Society Redevelopment', 'Sale Deed Drafting'],
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
      languages: ['English', 'Marathi', 'Hindi'],
      specialties: ['RERA Builder Delays', 'Index-2 Registration', 'Lease Agreements'],
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
      languages: ['English', 'Marathi', 'Hindi'],
      specialties: ['Deemed Conveyance', '7/12 Mutation', 'Gift & Succession Deeds'],
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
      languages: ['English', 'Hindi', 'Gujarati'],
      specialties: ['Stamp Duty Appeals', 'Commercial Lease', 'Title Search'],
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
      languages: ['English', 'Marathi'],
      specialties: ['Co-op Housing Society Disputes', '7/12 Extract Correction', 'Conveyance Deeds'],
      consultationFee: 299,
    },
  ];

  const filteredLawyers = lawyersCatalog.filter((lawyer) => {
    const matchesPractice = selectedPractice === 'all' || lawyer.practice === selectedPractice;
    const matchesRegion = selectedRegion === 'all' || lawyer.region === selectedRegion;
    const matchesSearch =
      searchQuery === '' ||
      lawyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lawyer.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      lawyer.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesPractice && matchesRegion && matchesSearch;
  });

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      {/* Header & Search */}
      <section className="bg-slate-900 text-white py-12 border-b border-slate-800">
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
            <div className="inline-flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300">
              <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Fixed ₹299 Unlock Facilitation Fee</span>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Filter & Roster */}
      <section className="py-10 flex-1">
        <Container>
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
                      onChange={(e) => setSearchQuery(e.target.value)}
                      leftIcon={<Search className="h-4 w-4" />}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Legal Practice Area
                    </label>
                    <Select
                      value={selectedPractice}
                      onChange={(e) => setSelectedPractice(e.target.value)}
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
                      onChange={(e) => setSelectedRegion(e.target.value)}
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
                    }}
                  >
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Lawyers List */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">
                  Showing <span className="text-slate-900 font-bold">{filteredLawyers.length}</span> verified advocates in Mumbai
                </p>
              </div>

              {filteredLawyers.map((lawyer) => (
                <Card key={lawyer.id} className="border-slate-200 hover:border-blue-300 transition-all shadow-xs">
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
                        <p className="text-xs text-slate-500 mt-1 font-medium">Consultation Unlock: ₹299</p>
                      </div>

                      <Link href="/register">
                        <Button variant="primary" size="sm">
                          Unlock & Book
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
}
