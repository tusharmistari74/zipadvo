'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, Badge, Rating, Button, Avatar } from '@legalhub/ui';
import { MapPin, Navigation, Scale, ShieldCheck, ChevronRight, X, Compass, CheckCircle2, Layers, Map as MapIcon } from 'lucide-react';
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
  distanceKm?: number;
}

export interface MumbaiLawyerMapProps {
  lawyers: LawyerMarkerItem[];
  selectedRegion?: string;
  onSelectLawyer?: (lawyer: LawyerMarkerItem) => void;
  className?: string;
}

// Calculate real-world geodesic distance in km using Haversine formula
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Pre-defined Mumbai Court Cluster hubs with real coordinates
const MUMBAI_COURT_HUBS = [
  {
    id: 'bost-hc',
    name: 'Bombay High Court & Fort Chambers',
    region: 'south',
    lat: 18.9298,
    lng: 72.8335,
    x: 48,
    y: 82,
    count: 38,
  },
  {
    id: 'maharera-bkc',
    name: 'MahaRERA Tribunal & BKC Chambers',
    region: 'western',
    lat: 19.0657,
    lng: 72.8687,
    x: 52,
    y: 58,
    count: 24,
  },
  {
    id: 'bandra-court',
    name: 'Bandra Metropolitan & Family Court',
    region: 'western',
    lat: 19.0596,
    lng: 72.8295,
    x: 44,
    y: 52,
    count: 19,
  },
  {
    id: 'dindoshi-court',
    name: 'Dindoshi & Borivali City Civil Court',
    region: 'western',
    lat: 19.1663,
    lng: 72.8526,
    x: 46,
    y: 30,
    count: 27,
  },
  {
    id: 'kurla-court',
    name: 'Kurla & Ghatkopar Civil Court',
    region: 'eastern',
    lat: 19.086,
    lng: 72.908,
    x: 62,
    y: 48,
    count: 16,
  },
  {
    id: 'thane-court',
    name: 'Thane District & Sessions Court',
    region: 'thane',
    lat: 19.2183,
    lng: 72.9781,
    x: 74,
    y: 24,
    count: 31,
  },
];

// Dark mode map theme for Google Maps styling
const GOOGLE_MAPS_DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#334155' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0284c7' }, { lightness: -60 }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
];

const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyArMH1TV9RKOMFm-69ckReSUvKphw2sUwQ';

export function MumbaiLawyerMap({
  lawyers,
  selectedRegion = 'all',
  onSelectLawyer,
  className = '',
}: MumbaiLawyerMapProps) {
  const [activeHub, setActiveHub] = useState<string | null>(null);
  const [activeLawyer, setActiveLawyer] = useState<LawyerMarkerItem | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number | null>(null);
  const [mapMode, setMapMode] = useState<'google' | 'cluster'>('google');
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  const googleMapContainerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const googleMapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);

  // Load Google Maps JavaScript API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).google?.maps) {
      setIsGoogleMapsLoaded(true);
      return;
    }

    const scriptId = 'google-maps-script-zipadvo';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsGoogleMapsLoaded(true);
    };
    script.onerror = () => {
      setMapMode('cluster');
    };
    document.head.appendChild(script);
  }, []);

  // Auto-request or user-triggered geolocation
  const handleLocateClient = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setLocationStatus('Locating your GPS coordinates in Mumbai...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setIsLocating(false);
        setLocationStatus('GPS Locked: Showing nearest advocates & chambers');
        setMaxDistanceKm(25); // Default to 25km nearby radius

        if (googleMapInstanceRef.current) {
          googleMapInstanceRef.current.panTo(coords);
          googleMapInstanceRef.current.setZoom(13);
        }
      },
      () => {
        // Fallback to Central Mumbai (Bandra / BKC)
        const fallback = { lat: 19.0596, lng: 72.8295 };
        setUserLocation(fallback);
        setIsLocating(false);
        setLocationStatus('Defaulted to Bandra / Central Mumbai region.');
        if (googleMapInstanceRef.current) {
          googleMapInstanceRef.current.panTo(fallback);
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Filter hubs based on selected region
  const filteredHubs = useMemo(() => {
    if (selectedRegion === 'all') return MUMBAI_COURT_HUBS;
    return MUMBAI_COURT_HUBS.filter((h) => h.region === selectedRegion);
  }, [selectedRegion]);

  // Compute active advocates in selected hub or region and sort by distance if location available
  const visibleLawyers = useMemo(() => {
    let list = [...lawyers];
    if (activeHub) {
      const hub = MUMBAI_COURT_HUBS.find((h) => h.id === activeHub);
      if (hub) {
        list = list.filter((l) => l.region === hub.region);
      }
    } else if (selectedRegion !== 'all') {
      list = list.filter((l) => l.region === selectedRegion);
    }

    if (userLocation) {
      list = list
        .map((lawyer) => ({
          ...lawyer,
          distanceKm: calculateDistanceKm(userLocation.lat, userLocation.lng, lawyer.lat, lawyer.lng),
        }))
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

      if (maxDistanceKm) {
        const nearbyOnly = list.filter((l) => (l.distanceKm ?? 0) <= maxDistanceKm);
        if (nearbyOnly.length > 0) return nearbyOnly;
      }
    }

    return list;
  }, [activeHub, selectedRegion, lawyers, userLocation, maxDistanceKm]);

  // Initialize or update Google Maps instance and markers
  useEffect(() => {
    if (!isGoogleMapsLoaded || mapMode !== 'google' || !googleMapContainerRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const google = (window as any).google;
    if (!google?.maps) return;

    if (!googleMapInstanceRef.current) {
      googleMapInstanceRef.current = new google.maps.Map(googleMapContainerRef.current, {
        center: { lat: 19.076, lng: 72.8777 },
        zoom: 11,
        styles: GOOGLE_MAPS_DARK_STYLE,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });
    }

    const map = googleMapInstanceRef.current;

    // Clear previous markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Add Court Hubs Markers
    filteredHubs.forEach((hub) => {
      const marker = new google.maps.Marker({
        position: { lat: hub.lat, lng: hub.lng },
        map,
        title: hub.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#3b82f6',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      marker.addListener('click', () => {
        setActiveHub(hub.id);
        const firstLawyer = lawyers.find((l) => l.region === hub.region);
        if (firstLawyer) {
          setActiveLawyer(firstLawyer);
          if (onSelectLawyer) onSelectLawyer(firstLawyer);
        }
      });

      markersRef.current.push(marker);
    });

    // Add Lawyer Markers
    visibleLawyers.forEach((lawyer) => {
      const marker = new google.maps.Marker({
        position: { lat: lawyer.lat, lng: lawyer.lng },
        map,
        title: lawyer.name,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#10b981',
          fillOpacity: 1,
          strokeColor: '#0f172a',
          strokeWeight: 1.5,
        },
      });

      marker.addListener('click', () => {
        setActiveLawyer(lawyer);
        if (onSelectLawyer) onSelectLawyer(lawyer);
      });

      markersRef.current.push(marker);
    });

    // Add User Location Marker if available
    if (userLocation) {
      const userMarker = new google.maps.Marker({
        position: userLocation,
        map,
        title: 'Your Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#ec4899',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });
      markersRef.current.push(userMarker);
    }
  }, [isGoogleMapsLoaded, mapMode, filteredHubs, visibleLawyers, userLocation, lawyers, onSelectLawyer]);

  // Select first lawyer by default if none active
  useEffect(() => {
    if (!activeLawyer && visibleLawyers.length > 0) {
      setActiveLawyer(visibleLawyers[0] || null);
    }
  }, [visibleLawyers, activeLawyer]);

  return (
    <Card className={`overflow-hidden border-slate-200 bg-slate-900 text-white shadow-md ${className}`}>
      {/* Map Header Controls */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 py-3 gap-2">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-bold tracking-wider uppercase text-slate-200">
            ZipAdvo Real-Life Mumbai Jurisdiction Map
          </span>
          <Badge variant="brand" size="sm" className="hidden sm:inline-flex bg-blue-900/60 text-blue-300 border-blue-700">
            Google Maps Powered
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Map Style Toggle */}
          <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
            <button
              type="button"
              onClick={() => setMapMode('google')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                mapMode === 'google' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapIcon className="h-3 w-3" />
              <span>Google Map</span>
            </button>
            <button
              type="button"
              onClick={() => setMapMode('cluster')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                mapMode === 'cluster' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="h-3 w-3" />
              <span>Court Hubs</span>
            </button>
          </div>

          {/* Locate Me GPS CTA */}
          <button
            type="button"
            onClick={handleLocateClient}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 text-xs font-semibold transition-all focus:outline-none"
          >
            <Compass className={`h-3.5 w-3.5 ${isLocating ? 'animate-spin' : 'text-blue-400'}`} />
            <span>{isLocating ? 'Locating...' : userLocation ? 'Nearby Active' : '📍 Locate Me'}</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 pl-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{visibleLawyers.length} Advocates</span>
          </div>
        </div>
      </div>

      {locationStatus && (
        <div className="bg-blue-950/50 border-b border-blue-900/50 px-4 py-1.5 text-[11px] text-blue-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            {locationStatus}
          </span>
          {userLocation && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMaxDistanceKm(10)}
                className={`px-1.5 py-0.5 rounded text-[10px] ${maxDistanceKm === 10 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Within 10 km
              </button>
              <button
                type="button"
                onClick={() => setMaxDistanceKm(25)}
                className={`px-1.5 py-0.5 rounded text-[10px] ${maxDistanceKm === 25 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Within 25 km
              </button>
              <button
                type="button"
                onClick={() => setMaxDistanceKm(null)}
                className={`px-1.5 py-0.5 rounded text-[10px] ${maxDistanceKm === null ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                All Mumbai MMR
              </button>
            </div>
          )}
        </div>
      )}

      {/* Interactive Map Visual Stage */}
      <div className="relative min-h-[380px] sm:min-h-[440px] bg-slate-950 flex flex-col justify-between select-none">
        {/* Google Maps Container */}
        {mapMode === 'google' ? (
          <div className="relative w-full h-[380px] sm:h-[440px]">
            <div ref={googleMapContainerRef} className="w-full h-full rounded-b-lg" />
            {!isGoogleMapsLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 text-slate-300 text-sm">
                <Compass className="h-5 w-5 animate-spin mr-2 text-blue-400" />
                Loading Interactive Mumbai Map...
              </div>
            )}
          </div>
        ) : (
          <div className="relative min-h-[380px] sm:min-h-[420px] bg-radial from-slate-900 to-slate-950 p-6 flex flex-col justify-between">
            {/* Mumbai Coastline & Geographic Watermark Grid */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />

            {/* Court Cluster Nodes (SVG / CSS Absolute Pinning) */}
            <div className="relative w-full h-[320px] max-w-2xl mx-auto my-auto">
              {filteredHubs.map((hub) => {
                const isSelected = activeHub === hub.id;
                const distance = userLocation ? calculateDistanceKm(userLocation.lat, userLocation.lng, hub.lat, hub.lng) : null;

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
                      <span className="truncate max-w-[120px] sm:max-w-[170px]">{hub.name.split('&')[0]}</span>
                      {distance !== null ? (
                        <span className="bg-emerald-950 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                          {distance} km
                        </span>
                      ) : (
                        <span className="bg-blue-950/80 text-blue-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                          {hub.count}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Hub / Advocate Detail Floating Overlay */}
        {activeLawyer && (
          <div className="relative z-20 m-4 rounded-xl border border-slate-700 bg-slate-900/95 p-4 backdrop-blur-md transition-all shadow-xl animate-in fade-in slide-in-from-bottom-2">
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
                    {userLocation && (
                      <span className="inline-flex items-center rounded-full bg-blue-900/60 border border-blue-700 px-2 py-0.5 text-[10px] font-semibold text-blue-200">
                        📍 {calculateDistanceKm(userLocation.lat, userLocation.lng, activeLawyer.lat, activeLawyer.lng)} km near you
                      </span>
                    )}
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
                <Link href={`/lawyers/${activeLawyer.id}`}>
                  <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <span>View Profile & Book</span>
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
                <button
                  type="button"
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
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 border-t border-slate-800/80 px-4 py-3 bg-slate-950/90">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span>Court Cluster Hubs</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span>Verified Advocates</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-pink-500" />
              <span>Your GPS Pin</span>
            </span>
          </div>
          <span>Toggle between Google Map & Court Hubs schematic view</span>
        </div>
      </div>
    </Card>
  );
}


