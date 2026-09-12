import { z } from 'zod';
import { mumbaiAddressSchema } from './user.schema';

export const sanadNumberRegex = /^MAH\/\d{1,6}\/\d{4}$/i;
export const panCardRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const aadhaarLastFourRegex = /^\d{4}$/;

export const MAX_KYC_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_KYC_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const practiceAreasEnum = z.enum([
  'Property Registration & Conveyancing',
  'Title Verification & Due Diligence',
  'RERA Advisory & Disputes',
  'Society Matters & Redevelopment',
  'Lease & Rent Agreements',
  'Gift Deed & Succession Certification',
  'Stamp Duty & Registration Appeals',
  'Civil & Property Litigation',
]);

export const mumbaiCourtsEnum = z.enum([
  'Bombay High Court',
  'City Civil and Sessions Court (Fort)',
  'Dindoshi Court',
  'Bandra Metropolitan Magistrate Court',
  'Andheri Court',
  'Borivali Court',
  'Kurla Court',
  'Thane District Court',
  'MahaRERA Tribunal (Bandra-Kurla Complex)',
]);

// Step 1: Personal & Profile Info
export const personalInfoStepSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

// Step 2: Bar Council & Court
export const barCouncilStepSchema = z.object({
  sanadNumber: z
    .string()
    .regex(sanadNumberRegex, 'Sanad Number must follow the format MAH/1234/2015'),
  enrollmentYear: z
    .number({ invalid_type_error: 'Enrollment year must be a valid number' })
    .int()
    .min(1950, 'Enrollment year must be 1950 or later')
    .max(new Date().getFullYear(), 'Enrollment year cannot be in the future'),
  stateBarCouncil: z.string().default('Bar Council of Maharashtra and Goa'),
  primaryCourt: mumbaiCourtsEnum,
  additionalCourts: z.array(z.string()).default([]),
});

// Step 3: Specialization & Experience
export const specializationStepSchema = z.object({
  title: z
    .string()
    .min(5, 'Professional title must be at least 5 characters')
    .max(120),
  bio: z
    .string()
    .min(30, 'Professional bio must be at least 30 characters')
    .max(2000),
  practiceAreas: z
    .array(practiceAreasEnum)
    .min(1, 'Select at least one core practice specialization'),
  yearsOfExperience: z
    .number({ invalid_type_error: 'Years of practice must be a number' })
    .min(1, 'Minimum 1 year of legal practice required')
    .max(65),
  spokenLanguages: z
    .array(z.string())
    .min(1, 'Select at least one spoken language'),
});

// Step 4: Chamber Address & Fees
export const chamberAndFeesStepSchema = z.object({
  officeAddress: mumbaiAddressSchema,
  consultationFeeInr: z
    .number({ invalid_type_error: 'Consultation fee must be a number' })
    .min(0, 'Fee cannot be negative')
    .max(100000, 'Fee cannot exceed ₹1,00,000'),
  isAcceptingBookings: z.boolean().default(true),
});

// Step 5: Availability Schedule
export const availabilitySlotSchema = z.object({
  dayOfWeek: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
  ]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:mm format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:mm format'),
  isAvailable: z.boolean(),
});

export const availabilityStepSchema = z.object({
  availabilitySchedule: z
    .array(availabilitySlotSchema)
    .min(1, 'At least one day schedule is required'),
});

// Step 6: Private KYC Documents
export const kycDocumentsStepSchema = z.object({
  panNumber: z
    .string()
    .regex(panCardRegex, 'Invalid PAN format (e.g. ABCDE1234F)'),
  panCardStoragePath: z
    .string()
    .min(1, 'PAN Card document upload is mandatory'),
  aadhaarLastFour: z
    .string()
    .regex(aadhaarLastFourRegex, 'Must provide exact last 4 digits of Aadhaar number'),
  aadhaarProofStoragePath: z
    .string()
    .min(1, 'Aadhaar document upload is mandatory'),
  sanadNumber: z
    .string()
    .regex(sanadNumberRegex, 'Sanad Number must follow the format MAH/1234/2015'),
  sanadCertificateStoragePath: z
    .string()
    .min(1, 'Bar Council Sanad Certificate upload is mandatory'),
  officeProofStoragePath: z.string().optional().or(z.literal('')),
});

// Complete Onboarding Submission Schema
export const lawyerOnboardingSchema = z.object({
  personalInfo: personalInfoStepSchema,
  professionalInfo: barCouncilStepSchema,
  specializationInfo: specializationStepSchema,
  chamberAndFees: chamberAndFeesStepSchema,
  availability: availabilityStepSchema,
  kycDocuments: kycDocumentsStepSchema,
});

export const barCouncilSchema = z.object({
  sanadNumber: z.string().regex(sanadNumberRegex, 'Sanad Number must follow the format MAH/1234/2015'),
  enrollmentYear: z.number().int().min(1950).max(new Date().getFullYear()),
  stateBarCouncil: z.string().default('Bar Council of Maharashtra and Goa'),
  sanadCertificateStoragePath: z.string().min(1, 'Sanad certificate document is required'),
});

export const lawyerKycSubmissionSchema = kycDocumentsStepSchema;

export const lawyerProfileUpdateSchema = z.object({
  fullName: z.string().min(2).max(100),
  title: z.string().min(5).max(120),
  bio: z.string().min(30, 'Bio must be at least 30 characters').max(2000),
  practiceAreas: z.array(practiceAreasEnum).min(1, 'Select at least one practice area'),
  primaryCourt: mumbaiCourtsEnum,
  yearsOfExperience: z.number().min(0).max(60),
  spokenLanguages: z.array(z.string()).min(1),
  officeAddress: mumbaiAddressSchema,
  consultationFeeInr: z.number().min(0).max(100000),
  isAcceptingBookings: z.boolean().default(true),
});

export type LawyerPersonalInfoStepInput = z.infer<typeof personalInfoStepSchema>;
export type LawyerBarCouncilStepInput = z.infer<typeof barCouncilStepSchema>;
export type LawyerSpecializationStepInput = z.infer<typeof specializationStepSchema>;
export type LawyerChamberAndFeesStepInput = z.infer<typeof chamberAndFeesStepSchema>;
export type LawyerAvailabilityStepInput = z.infer<typeof availabilityStepSchema>;
export type LawyerKycDocumentsStepInput = z.infer<typeof kycDocumentsStepSchema>;
export type LawyerOnboardingInput = z.infer<typeof lawyerOnboardingSchema>;
export type LawyerKycSubmissionInput = z.infer<typeof lawyerKycSubmissionSchema>;
export type LawyerProfileUpdateInput = z.infer<typeof lawyerProfileUpdateSchema>;
