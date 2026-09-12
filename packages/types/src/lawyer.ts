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
  availabilitySchedule?: LawyerAvailabilitySlot[];
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

