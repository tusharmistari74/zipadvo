'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container, Button } from '@legalhub/ui';
import { useAuth } from '../../lib/auth/context';
import { Scale, Menu, X, ShieldCheck, User } from 'lucide-react';
import { NotificationBell } from '../notifications/notification-bell';

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, profile, role } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { label: 'Find a Lawyer', href: '/find-lawyer' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'For Lawyers', href: '/for-lawyers' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const getDashboardLink = () => {
    if (role === 'admin' || role === 'super_admin') return '/admin';
    if (role === 'lawyer') return '/lawyer';
    return '/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs group-hover:bg-blue-700 transition-colors">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-lg font-bold tracking-tight text-slate-900">
                  Zip<span className="text-blue-700">Advo</span>
                </span>
                <span className="inline-flex items-center rounded-sm bg-blue-50 px-1 py-0.5 text-[10px] font-semibold text-blue-700">
                  <ShieldCheck className="h-3 w-3 mr-0.5" />
                  Verified
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide hidden sm:block">
                Verified Advocates & Property Registry Network
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'text-blue-700 bg-blue-50/70 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden md:flex items-center space-x-3">
            {mounted && isAuthenticated ? (
              <div className="flex items-center gap-2">
                <NotificationBell />
                <Link href={getDashboardLink()}>
                  <Button variant="outline" size="sm" leftIcon={<User className="h-4 w-4" />}>
                    {profile?.fullName ? profile.fullName.split(' ')[0] : 'My Portal'}
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/find-lawyer">
                  <Button variant="primary" size="sm">
                    Find a Lawyer
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </Container>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 text-base font-medium rounded-lg ${
                  pathname === link.href ? 'text-blue-700 bg-blue-50 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {mounted && isAuthenticated ? (
              <Link href={getDashboardLink()} onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" fullWidth leftIcon={<User className="h-4 w-4" />}>
                  Go to Dashboard ({profile?.role?.toUpperCase() || 'USER'})
                </Button>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" fullWidth size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/find-lawyer" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" fullWidth size="sm">
                    Find Lawyer
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
