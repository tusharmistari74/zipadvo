/**
 * Application Constants & Route Definitions
 */

export const APP_NAME = 'ZipAdvo' as const;
export const APP_TAGLINE = 'Verified Property & Document Registration Lawyers' as const;

export const DEFAULT_CONSULTATION_UNLOCK_FEE_INR = 299 as const;
export const GST_RATE = 0.18 as const;

export const MUMBAI_REGIONS = [
  'South Mumbai (Fort, Colaba, Nariman Point, Marine Lines)',
  'Central Mumbai (Dadar, Parel, Worli, Lower Parel)',
  'Western Suburbs (Bandra, Khar, Santa Cruz, Andheri, Juhu, Goregaon, Malad, Borivali)',
  'Eastern Suburbs (Ghatkopar, Kurla, Chembur, Mulund, Bhandup)',
  'Navi Mumbai (Vashi, Nerul, Belapur, Kharghar, Panvel)',
  'Thane & Mira-Bhayandar',
] as const;

export const MUMBAI_COURTS = [
  'Bombay High Court',
  'City Civil and Sessions Court (Fort)',
  'Dindoshi Court',
  'Bandra Metropolitan Magistrate Court',
  'Andheri Court',
  'Borivali Court',
  'Kurla Court',
  'Thane District Court',
  'MahaRERA Tribunal (Bandra-Kurla Complex)',
] as const;

export const PRACTICE_AREAS = [
  'Property Registration & Conveyancing',
  'Title Verification & Due Diligence',
  'RERA Advisory & Disputes',
  'Society Matters & Redevelopment',
  'Lease & Rent Agreements',
  'Gift Deed & Succession Certification',
  'Stamp Duty & Registration Appeals',
  'Civil & Property Litigation',
] as const;

export const ROUTES = {
  HOME: '/',
  FIND_LAWYER: '/find-lawyer',
  LAWYER_PROFILE: (lawyerId: string) => `/lawyers/${lawyerId}`,
  BOOKING_DETAIL: (bookingId: string) => `/booking/${bookingId}`,
  CLIENT_DASHBOARD: '/dashboard',
  LAWYER_PORTAL: {
    ROOT: '/lawyer',
    PROFILE: '/lawyer/profile',
    KYC: '/lawyer/kyc',
    BOOKINGS: '/lawyer/bookings',
    DOCUMENTS: '/lawyer/documents',
    EARNINGS: '/lawyer/earnings',
  },
  ADMIN_PORTAL: {
    ROOT: '/admin',
    USERS: '/admin/users',
    LAWYERS: '/admin/lawyers',
    LAWYER_DETAIL: (lawyerId: string) => `/admin/lawyers/${lawyerId}`,
    BOOKINGS: '/admin/bookings',
    PAYMENTS: '/admin/payments',
    DISPUTES: '/admin/disputes',
    SETTINGS: '/admin/settings',
  },
} as const;
