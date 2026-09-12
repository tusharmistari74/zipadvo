import { describe, it, expect } from 'vitest';
import {
  canTransitionKycStatus,
  validateKycFile,
  getPrivateKycStoragePath,
  maskSensitiveId,
} from '../../apps/web/src/lib/services/lawyer-kyc.service';
import {
  lawyerOnboardingSchema,
  sanadNumberRegex,
  panCardRegex,
  aadhaarLastFourRegex,
  type LawyerOnboardingInput,
} from '@legalhub/validation';

describe('Lawyer KYC Lifecycle & State Transitions', () => {
  it('should allow valid KYC lifecycle transitions', () => {
    expect(canTransitionKycStatus('draft', 'submitted')).toBe(true);
    expect(canTransitionKycStatus('submitted', 'under_review')).toBe(true);
    expect(canTransitionKycStatus('under_review', 'verified')).toBe(true);
    expect(canTransitionKycStatus('under_review', 'rejected')).toBe(true);
    expect(canTransitionKycStatus('rejected', 'draft')).toBe(true);
    expect(canTransitionKycStatus('rejected', 'submitted')).toBe(true);
    expect(canTransitionKycStatus('verified', 'suspended')).toBe(true);
    expect(canTransitionKycStatus('suspended', 'verified')).toBe(true);
  });

  it('should disallow invalid transitions', () => {
    expect(canTransitionKycStatus('draft', 'verified')).toBe(false); // cannot jump straight to verified without submission
    expect(canTransitionKycStatus('submitted', 'suspended')).toBe(false);
  });
});

describe('Private Document Upload Validation & Path Security', () => {
  it('should accept valid PDF and image files under 5MB', () => {
    const validPdf = { name: 'sanad.pdf', size: 2 * 1024 * 1024, type: 'application/pdf' };
    const validJpg = { name: 'pan.jpg', size: 1.5 * 1024 * 1024, type: 'image/jpeg' };

    expect(validateKycFile(validPdf).valid).toBe(true);
    expect(validateKycFile(validJpg).valid).toBe(true);
  });

  it('should reject files exceeding 5MB', () => {
    const largeFile = { name: 'heavy_doc.pdf', size: 6 * 1024 * 1024, type: 'application/pdf' };
    const res = validateKycFile(largeFile);

    expect(res.valid).toBe(false);
    expect(res.error).toContain('maximum allowed size of 5MB');
  });

  it('should reject unpermitted file types like executables or zip archives', () => {
    const exeFile = { name: 'malware.exe', size: 1024, type: 'application/x-msdownload' };
    const zipFile = { name: 'archive.zip', size: 1024, type: 'application/zip' };

    expect(validateKycFile(exeFile).valid).toBe(false);
    expect(validateKycFile(zipFile).valid).toBe(false);
  });

  it('should generate secure private storage paths with sanitized filenames', () => {
    const path = getPrivateKycStoragePath('lawyer_123', 'sanad', 'my certificate #1.pdf');

    expect(path).toMatch(/^lawyer_kyc\/lawyer_123\/sanad_\d+_my_certificate__1\.pdf$/);
    expect(path).not.toContain('public');
  });

  it('should correctly mask sensitive PAN and Aadhaar identity numbers', () => {
    expect(maskSensitiveId('pan', 'ABCDE1234F')).toBe('AB****234F');
    expect(maskSensitiveId('aadhaar', '9876')).toBe('**** **** 9876');
  });
});

describe('Lawyer Onboarding Schema Validation', () => {
  const validOnboardingInput: LawyerOnboardingInput = {
    personalInfo: {
      fullName: 'Adv. Suresh K. Patil',
      email: 'suresh.patil@legalhub.in',
      phone: '+919876543210',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
    professionalInfo: {
      sanadNumber: 'MAH/4567/2014',
      enrollmentYear: 2014,
      stateBarCouncil: 'Bar Council of Maharashtra and Goa',
      primaryCourt: 'Bombay High Court',
      additionalCourts: ['City Civil and Sessions Court (Fort)'],
    },
    specializationInfo: {
      title: 'Senior Property Advocate & Title Specialist',
      bio: 'Over 12 years of specialized practice handling Mumbai property registrations, conveyance deed drafting, and title verification.',
      practiceAreas: ['Property Registration & Conveyancing', 'Title Verification & Due Diligence'],
      yearsOfExperience: 12,
      spokenLanguages: ['English', 'Marathi', 'Hindi'],
    },
    chamberAndFees: {
      officeAddress: {
        line1: 'Office 301, Nariman Bhavan',
        area: 'Nariman Point',
        city: 'Mumbai',
        pincode: '400021',
        state: 'Maharashtra',
        country: 'India',
      },
      consultationFeeInr: 2000,
      isAcceptingBookings: true,
    },
    availability: {
      availabilitySchedule: [
        { dayOfWeek: 1, startTime: '10:00', endTime: '18:00', isAvailable: true },
        { dayOfWeek: 2, startTime: '10:00', endTime: '18:00', isAvailable: true },
      ],
    },
    kycDocuments: {
      panNumber: 'ABCDE1234F',
      panCardStoragePath: 'lawyer_kyc/uid/pan.pdf',
      aadhaarLastFour: '5678',
      aadhaarProofStoragePath: 'lawyer_kyc/uid/aadhaar.pdf',
      sanadNumber: 'MAH/4567/2014',
      sanadCertificateStoragePath: 'lawyer_kyc/uid/sanad.pdf',
    },
  };

  it('should validate complete valid onboarding data', () => {
    const result = lawyerOnboardingSchema.safeParse(validOnboardingInput);
    expect(result.success).toBe(true);
  });

  it('should fail when Sanad number format is invalid', () => {
    const invalidInput = {
      ...validOnboardingInput,
      professionalInfo: {
        ...validOnboardingInput.professionalInfo,
        sanadNumber: 'INVALID_SANAD',
      },
    };
    const result = lawyerOnboardingSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it('should fail when PAN card format is invalid', () => {
    const invalidInput = {
      ...validOnboardingInput,
      kycDocuments: {
        ...validOnboardingInput.kycDocuments,
        panNumber: '12345ABCDE', // wrong pattern
      },
    };
    const result = lawyerOnboardingSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it('should validate Sanad regex pattern', () => {
    expect(sanadNumberRegex.test('MAH/1234/2015')).toBe(true);
    expect(sanadNumberRegex.test('MAH/1/2020')).toBe(true);
    expect(sanadNumberRegex.test('DELHI/123/2015')).toBe(false);
  });

  it('should validate PAN and Aadhaar regex patterns', () => {
    expect(panCardRegex.test('ABCDE1234F')).toBe(true);
    expect(panCardRegex.test('abcde1234f')).toBe(false); // must be uppercase
    expect(aadhaarLastFourRegex.test('1234')).toBe(true);
    expect(aadhaarLastFourRegex.test('123')).toBe(false);
  });
});
