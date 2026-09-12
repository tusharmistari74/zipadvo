import { describe, it, expect } from 'vitest';
import {
  sanitizePublicLawyerProfile,
  getPublicLawyerProfile,
} from '../../apps/web/src/lib/services/lawyer-profile.service';
import type { LawyerProfile, LawyerReview } from '@legalhub/types';

describe('Lawyer Profile Service & Public Data Sanitization', () => {
  const mockRawLawyer: LawyerProfile = {
    id: 'lawyer-test-123',
    uid: 'lawyer-test-123',
    fullName: 'Adv. Test User',
    title: 'Property Legal Specialist',
    bio: 'Experienced Mumbai lawyer.',
    practiceAreas: ['Property Registration & Conveyancing', 'Title Verification & Due Diligence'],
    primaryCourt: 'Bombay High Court',
    yearsOfExperience: 10,
    spokenLanguages: ['English', 'Marathi'],
    officeAddress: {
      line1: '123 Fort Chambers',
      area: 'Fort',
      city: 'Mumbai',
      pincode: '400001',
      state: 'Maharashtra',
      country: 'India',
    },
    barCouncil: {
      sanadNumber: 'MAH/9999/2016',
      enrollmentYear: 2016,
      stateBarCouncil: 'Bar Council of Maharashtra and Goa',
      sanadCertificateStoragePath: 'lawyer_kyc/sanad_cert_private.pdf', // PRIVATE FIELD
    },
    kycStatus: 'verified',
    isAcceptingBookings: true,
    featured: false,
    consultationFeeInr: 1500,
    rating: 4.8,
    reviewCount: 10,
    totalConsultationsCompleted: 50,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  const mockReviews: LawyerReview[] = [
    {
      id: 'rev-1',
      bookingId: 'book-1',
      lawyerUid: 'lawyer-test-123',
      clientUid: 'client-1',
      clientDisplayName: 'Sunil K.',
      rating: 5,
      reviewTitle: 'Excellent Title Search',
      reviewComment: 'Very detailed property report.',
      status: 'published',
      isVerifiedClient: true,
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
    },
    {
      id: 'rev-2',
      bookingId: 'book-2',
      lawyerUid: 'lawyer-test-123',
      clientUid: 'client-2',
      clientDisplayName: 'Pooja R.',
      rating: 4,
      reviewTitle: 'Good guidance at SRO',
      reviewComment: 'Helped with biometric registration.',
      status: 'published',
      isVerifiedClient: true,
      createdAt: '2026-08-05T00:00:00Z',
      updatedAt: '2026-08-05T00:00:00Z',
    },
    {
      id: 'rev-3',
      bookingId: 'book-3',
      lawyerUid: 'lawyer-test-123',
      clientUid: 'client-3',
      clientDisplayName: 'Unpublished User',
      rating: 1,
      reviewTitle: 'Hidden Review',
      reviewComment: 'Spam review.',
      status: 'pending_moderation', // MUST BE EXCLUDED
      isVerifiedClient: false,
      createdAt: '2026-08-06T00:00:00Z',
      updatedAt: '2026-08-06T00:00:00Z',
    },
  ];

  it('should sanitize lawyer profile and exclude all sensitive KYC storage paths and internal fields', () => {
    const publicProfile = sanitizePublicLawyerProfile(mockRawLawyer, mockReviews);

    expect(publicProfile.id).toBe('lawyer-test-123');
    expect(publicProfile.fullName).toBe('Adv. Test User');
    expect(publicProfile.sanadNumber).toBe('MAH/9999/2016');
    expect(publicProfile.isSanadVerified).toBe(true);

    // Verify sensitive KYC paths are not in public profile object
    expect((publicProfile as unknown as Record<string, unknown>).sanadCertificateStoragePath).toBeUndefined();
    expect((publicProfile as unknown as Record<string, unknown>).panNumberEncrypted).toBeUndefined();
    expect((publicProfile as unknown as Record<string, unknown>).aadhaarLastFour).toBeUndefined();
    expect((publicProfile as unknown as Record<string, unknown>).internalNotes).toBeUndefined();
  });

  it('should only include published reviews and exclude pending moderation reviews', () => {
    const publicProfile = sanitizePublicLawyerProfile(mockRawLawyer, mockReviews);

    expect(publicProfile.reviews.length).toBe(2);
    expect(publicProfile.reviews.find((r) => r.id === 'rev-3')).toBeUndefined();
    expect(publicProfile.reviews[0].clientDisplayName).toBe('Sunil K.');
  });

  it('should correctly compute rating breakdown histogram', () => {
    const publicProfile = sanitizePublicLawyerProfile(mockRawLawyer, mockReviews);

    expect(publicProfile.ratingBreakdown[5]).toBe(1);
    expect(publicProfile.ratingBreakdown[4]).toBe(1);
    expect(publicProfile.ratingBreakdown[3]).toBe(0);
    expect(publicProfile.ratingBreakdown.total).toBe(2);
  });

  it('should fetch verified profile by ID from sample registry', async () => {
    const profile = await getPublicLawyerProfile('lawyer-1');

    expect(profile).not.toBeNull();
    expect(profile?.fullName).toBe('Adv. Rajeshwar M. Deshmukh');
    expect(profile?.sanadNumber).toBe('MAH/4821/2012');
    expect(profile?.isSanadVerified).toBe(true);
    expect(profile?.services.length).toBeGreaterThan(0);
  });

  it('should return null for non-existent or invalid lawyer ID', async () => {
    const profile = await getPublicLawyerProfile('non-existent-lawyer-xyz');
    expect(profile).toBeNull();
  });
});
