'use client';

import React, { useState, useMemo } from 'react';
import { Card, Badge, Rating, Button, Avatar } from '@legalhub/ui';
import { MapPin, Navigation, Scale, ShieldCheck, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';

export interface LawyerMarkerItem {
  id: string;
  name: string;
  title: string;
  sanad: string;
  court: string;
  experience: number;
  rating: number;
  reviewCount: number;
  location: string;
  region: 'south' | 'western' | 'eastern' | 'thane';
  practice: string;
  lat: number;
  lng: number;
  specialties: string[];
  consultationFee: number;
}

export interface MumbaiLawyerMapProps {
  lawyers: LawyerMarkerItem[];
  selectedRegion?: string;
  onSelectLawyer?: (lawyer: LawyerMarkerItem) => void;
  className?: string;
}

// Pre-defined Mumbai Court Cluster hubs with coordinates
const MUMBAI_COURT_HUBS = [
  {
    id: 'bost-hc',
    name: 'Bombay High Court & City Civil (Fort)',
    region: 'south',
    x: 48,
    y: 82,
    count: 38,
  },
  {
    id: 'maharera-bkc',
    name: 'MahaRERA & BKC Commercial Appellate',
    region: 'western',
    x: 52,
    y: 58,
    count: 24,
  },
  {
    id: 'bandra-court',
    name: 'Bandra Metropolitan & Family Court',
    region: 'western',
    x: 44,
    y: 52,
    count: 19,
  },
  {
    id: 'dindoshi-court',
    name: 'Dindoshi & Borivali City Civil Court',
    region: 'western',
    x: 46,
    y: 30,
    count: 27,
  },
  {
    id: 'kurla-court',
    name: 'Kurla & Ghatkopar Civil Court',
    region: 'eastern',
    x: 62,
    y: 48,
    count: 16,
  },
  {
    id: 'thane-court',
    name: 'Thane District & Sessions Court',
    region: 'thane',
    x: 74,
    y: 24,
    count: 31,
  },
];

export function MumbaiLawyerMap({
  lawyers,
  selectedRegion = 'all',
  onSelectLawyer,
  className = '',
}: MumbaiLawyerMapProps) {
  const [activeHub, setActiveHub] = useState<string | null>(null);
  const [activeLawyer, setActiveLawyer] = useState<LawyerMarkerItem | null>(null);

  // Filter hubs based on selected region
  const filteredHubs = useMemo(() => {
    if (selectedRegion === 'all') return MUMBAI_COURT_HUBS;
    return MUMBAI_COURT_HUBS.filter((h) => h.region === selectedRegion);
  }, [selectedRegion]);

  // Compute active advocates in selected hub or region
  const visibleLawyers = useMemo(() => {
    if (activeHub) {
      const hub = MUMBAI_COURT_HUBS.find((h) => h.id === activeHub);
      if (!hub) return lawyers;
      return lawyers.filter((l) => l.region === hub.region);
    }
    if (selectedRegion !== 'all') {
      return lawyers.filter((l) => l.region === selectedRegion);
    }
    return lawyers;
  }, [activeHub, selectedRegion, lawyers]);

  return (
    <Card className={`overflow-hidden border-slate-200 bg-slate-900 text-white shadow-md ${className}`}>
      {/* Map Header Controls */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-3 gap-2">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-bold tracking-wider uppercase text-slate-300">
            Mumbai Metropolitan Jurisdiction Map
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{filteredHubs.length} Court Jurisdictions • {visibleLawyers.length} Advocates Active</span>
        </div>
      </div>

      {/* Interactive Map Visual Stage */}
      <div className="relative min-h-[380px] sm:min-h-[420px] bg-radial from-slate-900 to-slate-950 p-6 flex flex-col justify-between select-none">
        {/* Mumbai Coastline & Geographic Watermark Grid */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />

        {/* Court Cluster Nodes (SVG / CSS Absolute Pinning) */}
        <div className="relative w-full h-[320px] max-w-2xl mx-auto my-auto">
          {filteredHubs.map((hub) => {
            const isSelected = activeHub === hub.id;
            return (
              <div
                key={hub.id}
                style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                onClick={() => {
                  setActiveHub(isSelected ? null : hub.id);
                  const firstLawyer = lawyers.find((l) => l.region === hub.region);
                  if (firstLawyer) {
                    setActiveLawyer(firstLawyer);
                    if (onSelectLawyer) onSelectLawyer(firstLawyer);
                  }
                }}
              >
                {/* Radar Ring */}
                <span
                  className={`absolute -inset-2 rounded-full opacity-75 transition-all ${
                    isSelected ? 'bg-blue-500/40 animate-ping' : 'group-hover:bg-blue-400/20'
                  }`}
                />

                {/* Hub Marker Badge */}
                <div
                  className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-lg transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white ring-2 ring-blue-300 scale-105'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700 group-hover:border-blue-400 group-hover:bg-slate-800'
                  }`}
                >
                  <Scale className="h-3 w-3 text-blue-400" />
                  <span className="truncate max-w-[130px] sm:max-w-[180px]">{hub.name.split('&')[0]}</span>
                  <span className="bg-blue-950/80 text-blue-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                    {hub.count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Hub / Advocate Detail Floating Overlay */}
        {activeLawyer && (
          <div className="relative z-20 mt-4 rounded-xl border border-slate-700 bg-slate-900/95 p-4 backdrop-blur-md transition-all shadow-xl animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Avatar name={activeLawyer.name} size="md" status="online" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-serif font-bold text-slate-100 text-sm">{activeLawyer.name}</h4>
                    <Badge variant="success" size="sm">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Sanad Verified
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300">{activeLawyer.title}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {activeLawyer.location}
                    </span>
                    <span>• {activeLawyer.experience} yrs exp</span>
                    <Rating value={activeLawyer.rating} reviewCount={activeLawyer.reviewCount} size="sm" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    <span>Unlock ₹299</span>
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
                <button
                  onClick={() => setActiveLawyer(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                  aria-label="Close advocate preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Legend */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 border-t border-slate-800/80 pt-3 mt-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>High Court & District Hubs</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Verified Bar Council Advocates</span>
            </span>
          </div>
          <span>Click any court cluster to view accredited advocates</span>
        </div>
      </div>
    </Card>
  );
}
