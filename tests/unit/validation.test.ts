import { describe, it, expect } from 'vitest';
import {
  userProfileSchema,
  mumbaiAddressSchema,
} from '../../packages/validation/src/user.schema';
import {
  lawyerKycSubmissionSchema,
  sanadNumberRegex,
} from '../../packages/validation/src/lawyer.schema';
import { createBookingSchema } from '../../packages/validation/src/booking.schema';

describe('Validation Schemas', () => {
  describe('mumbaiAddressSchema', () => {
    it('should validate valid Mumbai address and PIN code', () => {
      const validAddress = {
        line1: '1202, Maker Chambers V, Nariman Point',
        area: 'Nariman Point',
        city: 'Mumbai',
        pincode: '400021',
        state: 'Maharashtra',
        country: 'India',
      };
      const result = mumbaiAddressSchema.safeParse(validAddress);
      expect(result.success).toBe(true);
    });

    it('should reject invalid PIN code', () => {
      const invalidAddress = {
        line1: '12, Connaught Place',
        area: 'CP',
        city: 'Mumbai',
        pincode: '110001', // Delhi PIN
        state: 'Maharashtra',
        country: 'India',
      };
      const result = mumbaiAddressSchema.safeParse(invalidAddress);
      expect(result.success).toBe(false);
    });
  });

  describe('Sanad & Lawyer KYC Schema', () => {
    it('should validate standard Bar Council Sanad format', () => {
      expect(sanadNumberRegex.test('MAH/1234/2015')).toBe(true);
      expect(sanadNumberRegex.test('mah/5678/2020')).toBe(true);
      expect(sanadNumberRegex.test('DEL/1234/2015')).toBe(false);
      expect(sanadNumberRegex.test('INVALID_SANAD')).toBe(false);
    });

    it('should validate valid lawyer KYC submission', () => {
      const validKyc = {
        panNumber: 'ABCDE1234F',
        panCardStoragePath: 'kyc/lawyers/lawyer_123/pan.pdf',
        aadhaarLastFour: '4829',
        aadhaarProofStoragePath: 'kyc/lawyers/lawyer_123/aadhaar.pdf',
        sanadNumber: 'MAH/4521/2018',
        sanadCertificateStoragePath: 'kyc/lawyers/lawyer_123/sanad.pdf',
      };
      const result = lawyerKycSubmissionSchema.safeParse(validKyc);
      expect(result.success).toBe(true);
    });
  });

  describe('createBookingSchema', () => {
    it('should validate valid booking creation input', () => {
      const validBooking = {
        lawyerUid: 'lawyer_007',
        serviceCategory: 'Property Registration & Conveyancing',
        caseDescription: 'Need title verification and sale deed review for an apartment in Bandra West.',
        preferredDate: '2026-10-15',
        preferredTimeSlot: '14:00 - 15:00',
        consultationMode: 'in_person_office',
        clientName: 'Rahul Sharma',
        clientPhone: '+919876543210',
        clientEmail: 'rahul.sharma@example.com',
        uploadedDocumentIds: [],
      };
      const result = createBookingSchema.safeParse(validBooking);
      expect(result.success).toBe(true);
    });
  });
});
