import { z } from 'zod';
import { mumbaiAddressSchema } from './user.schema';

export const sanadNumberRegex = /^MAH\/\d{1,6}\/\d{4}$/i;
export const panCardRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const aadhaarLastFourRegex = /^\d{4}$/;

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

export const barCouncilSchema = z.object({
  sanadNumber: z.string().regex(sanadNumberRegex, 'Sanad Number must follow the format MAH/1234/2015'),
  enrollmentYear: z.number().int().min(1950).max(new Date().getFullYear()),
  stateBarCouncil: z.string().default('Bar Council of Maharashtra and Goa'),
  sanadCertificateStoragePath: z.string().min(1, 'Sanad certificate document is required'),
});

export const lawyerKycSubmissionSchema = z.object({
  panNumber: z.string().regex(panCardRegex, 'Invalid PAN format (e.g. ABCDE1234F)'),
  panCardStoragePath: z.string().min(1, 'PAN card document is required'),
  aadhaarLastFour: z.string().regex(aadhaarLastFourRegex, 'Must provide last 4 digits of Aadhaar'),
  aadhaarProofStoragePath: z.string().min(1, 'Aadhaar proof document is required'),
  sanadNumber: z.string().regex(sanadNumberRegex, 'Invalid Sanad Number'),
  sanadCertificateStoragePath: z.string().min(1, 'Sanad certificate document is required'),
  officeProofStoragePath: z.string().optional(),
});

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

export type LawyerKycSubmissionInput = z.infer<typeof lawyerKycSubmissionSchema>;
export type LawyerProfileUpdateInput = z.infer<typeof lawyerProfileUpdateSchema>;
