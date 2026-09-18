import { BaseEntity, MumbaiAddress } from './common';

export type PracticeArea =
  | 'Property Registration & Conveyancing'
  | 'Title Verification & Due Diligence'
  | 'RERA Advisory & Disputes'
  | 'Society Matters & Redevelopment'
  | 'Lease & Rent Agreements'
  | 'Gift Deed & Succession Certification'
  | 'Stamp Duty & Registration Appeals'
  | 'Civil & Property Litigation';

export type LawyerKYCStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'rejected'
  | 'suspended'
  | 'unverified';

export type MumbaiCourt =
  | 'Bombay High Court'
  | 'City Civil and Sessions Court (Fort)'
  | 'Dindoshi Court'
  | 'Bandra Metropolitan Magistrate Court'
  | 'Andheri Court'
  | 'Borivali Court'
  | 'Kurla Court'
  | 'Thane District Court'
  | 'MahaRERA Tribunal (Bandra-Kurla Complex)';

export interface BarCouncilDetails {
  sanadNumber: string; // Bar Council Registration Number e.g., MAH/1234/2015
  enrollmentYear: number;
  stateBarCouncil: 'Bar Council of Maharashtra and Goa' | string;
  sanadCertificateStoragePath: string;
}

export interface LawyerKYCSubmission {
  id?: string; // Lawyer UID
  panNumberEncrypted: string;
  panCardStoragePath: string;
  aadhaarLastFour: string;
  aadhaarProofStoragePath: string;
  sanadNumber: string;
  sanadCertificateStoragePath: string;
  officeProofStoragePath?: string;
  submittedAt: string;
  verifiedAt?: string;
  verifiedByAdminUid?: string;
  rejectionReason?: string;
}

export interface LawyerAvailabilitySlot {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sunday
  startTime: string; // 'HH:mm' 24h
  endTime: string;
  isAvailable: boolean;
}

export interface BreakInterval {
  id: string;
  label: string; // e.g., 'Lunch Recess', 'High Court Bench Hearing'
  startTime: string; // 'HH:mm' 24h
  endTime: string; // 'HH:mm' 24h
}

export interface DaySchedule {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sunday, 1=Monday ... 6=Saturday
  isAvailable: boolean;
  startTime: string; // 'HH:mm' e.g. '10:00'
  endTime: string; // 'HH:mm' e.g. '19:00'
  breaks: BreakInterval[];
}

export interface BlockedDate {
  id: string;
  date: string; // YYYY-MM-DD
  reason: string; // e.g., 'Bombay High Court Summer Vacation', 'Personal Leave', 'Public Holiday'
  createdAt?: string;
}

export interface SpecialDateSchedule {
  id: string;
  date: string; // YYYY-MM-DD
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
  breaks?: BreakInterval[];
  note?: string;
}

export interface LawyerAvailabilityConfig {
  timezone: string; // 'Asia/Kolkata' default
  slotDurationMinutes: number; // 30, 45, 60 mins (default 60)
  bufferMinutes: number; // buffer between slots (default 0 or 15)
  advanceBookingDays: number; // Max days in advance clients can book (default 14 or 30)
  minimumNoticeHours: number; // Min hours before slot start time (default 2)
  weeklySchedule: DaySchedule[];
  blockedDates: BlockedDate[];
  specialDates: SpecialDateSchedule[];
  updatedAt?: string;
}

export interface LawyerProfile extends BaseEntity {
  uid: string;
  fullName: string;
  title: string; // e.g., "Senior Property & Conveyancing Advocate"
  bio: string;
  avatarUrl?: string;
  practiceAreas: PracticeArea[];
  primaryCourt: MumbaiCourt;
  yearsOfExperience: number;
  spokenLanguages: string[]; // ['English', 'Marathi', 'Hindi', 'Gujarati']
  officeAddress: MumbaiAddress;
  barCouncil: BarCouncilDetails;
  kycStatus: LawyerKYCStatus;
  isAcceptingBookings: boolean;
  featured: boolean;
  consultationFeeInr: number; // Regular full fee
  rating: number; // 0.0 to 5.0
  reviewCount: number;
  totalConsultationsCompleted: number;
  chamberAddress?: string;
  availabilitySchedule?: LawyerAvailabilitySlot[];
  availabilityConfig?: LawyerAvailabilityConfig;
}

export interface PublicLawyerReview {
  id: string;
  clientName?: string;
  clientDisplayName?: string;
  rating: number;
  reviewTitle?: string;
  reviewText?: string;
  reviewComment?: string;
  serviceCategory?: string;
  isVerifiedClient?: boolean;
  createdAt: string;
}

export interface PublicLawyerService {
  id: string;
  name: string;
  category: string;
  description: string;
  indicativeFeeInr: number;
  durationEstimate: string;
}

export interface PublicLawyerRatingBreakdown {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
  total: number;
  average: number;
}

export interface PublicLawyerProfile {
  id: string;
  fullName: string;
  title: string;
  bio: string;
  avatarUrl?: string;
  practiceAreas: PracticeArea[];
  primaryCourt: MumbaiCourt;
  yearsOfExperience: number;
  spokenLanguages: string[];
  locality: string;
  city: string;
  sanadNumber: string;
  enrollmentYear: number;
  stateBarCouncil?: string;
  barCouncilName?: string;
  consultationFeeInr: number;
  rating: number;
  reviewCount: number;
  totalConsultationsCompleted: number;
  isAcceptingBookings: boolean;
  featured: boolean;
  chamberAddress?: string;
  reviews?: PublicLawyerReview[];
  services?: PublicLawyerService[];
  ratingBreakdown?: PublicLawyerRatingBreakdown;
  nextAvailableSlot?: string;
  isSanadVerified?: boolean;
}

export interface LawyerOnboardingDraft {
  currentStep: number;
  lastSavedAt: string;
  personalInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
  };
  professionalInfo?: {
    sanadNumber?: string;
    enrollmentYear?: number;
    stateBarCouncil?: string;
    primaryCourt?: MumbaiCourt;
    additionalCourts?: string[];
  };
  specializationInfo?: {
    title?: string;
    bio?: string;
    practiceAreas?: PracticeArea[];
    yearsOfExperience?: number;
    spokenLanguages?: string[];
  };
  chamberAndFees?: {
    officeAddress?: MumbaiAddress;
    consultationFeeInr?: number;
    isAcceptingBookings?: boolean;
  };
  availability?: {
    availabilitySchedule?: LawyerAvailabilitySlot[];
  };
  kycDocuments?: {
    panNumber?: string;
    panCardStoragePath?: string;
    aadhaarLastFour?: string;
    aadhaarProofStoragePath?: string;
    sanadNumber?: string;
    sanadCertificateStoragePath?: string;
    officeProofStoragePath?: string;
  };
}
