import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firestore
vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/firestore')>();
  return {
    ...actual,
    doc: vi.fn((_db, coll, id) => ({ id, path: `${coll}/${id}` })),
    getDoc: vi.fn(async () => ({
      exists: () => false,
      data: () => null,
    })),
    setDoc: vi.fn(async () => {}),
    addDoc: vi.fn(async () => ({ id: 'mock-audit-id' })),
    collection: vi.fn((_db, coll) => ({ path: coll })),
    runTransaction: vi.fn(async (_db, updateFunction) => {
      const mockTransaction = {
        get: vi.fn(async () => ({ exists: () => false, data: () => null })),
        set: vi.fn(),
      };
      return updateFunction(mockTransaction);
    }),
  };
});

import {
  generateDateSlots,
  generateDateRangeAvailability,
  getLawyerAvailabilityConfig,
  saveLawyerAvailabilityConfig,
  reserveBookingSlot,
  timeStringToMinutes,
  minutesToTimeString,
  getDayOfWeekFromDateString,
  getIsoDateInIST,
  DEFAULT_LAWYER_AVAILABILITY_CONFIG,
  MUMBAI_TIMEZONE,
} from '../../apps/web/src/lib/services/availability.service';
import {
  lawyerAvailabilityConfigSchema,
  breakIntervalSchema,
  dayScheduleSchema,
  blockedDateSchema,
  slotReservationRequestSchema,
} from '../../packages/validation/src/availability.schema';

describe('Lawyer Availability & Calendar Foundation', () => {
  const fixedNow = new Date('2026-09-14T09:00:00+05:30'); // Monday 9:00 AM IST

  describe('Time & Timezone Utilities (Asia/Kolkata)', () => {
    it('should correctly convert HH:mm string to minutes and back', () => {
      expect(timeStringToMinutes('00:00')).toBe(0);
      expect(timeStringToMinutes('10:30')).toBe(630);
      expect(timeStringToMinutes('19:00')).toBe(1140);

      expect(minutesToTimeString(630)).toBe('10:30');
      expect(minutesToTimeString(1140)).toBe('19:00');
    });

    it('should resolve correct day-of-week for Mumbai calendar dates', () => {
      // 2026-09-14 is Monday (1)
      expect(getDayOfWeekFromDateString('2026-09-14')).toBe(1);
      // 2026-09-20 is Sunday (0)
      expect(getDayOfWeekFromDateString('2026-09-20')).toBe(0);
      // 2026-09-19 is Saturday (6)
      expect(getDayOfWeekFromDateString('2026-09-19')).toBe(6);
    });

    it('should format ISO dates in Asia/Kolkata timezone', () => {
      const isoDate = getIsoDateInIST(fixedNow);
      expect(isoDate).toBe('2026-09-14');
      expect(MUMBAI_TIMEZONE).toBe('Asia/Kolkata');
    });
  });

  describe('Availability Zod Validation Schemas', () => {
    it('should validate standard default Mumbai lawyer configuration', () => {
      const result = lawyerAvailabilityConfigSchema.safeParse(DEFAULT_LAWYER_AVAILABILITY_CONFIG);
      expect(result.success).toBe(true);
    });

    it('should reject invalid time interval where start time >= end time', () => {
      const invalidBreak = {
        id: 'b1',
        label: 'Lunch',
        startTime: '14:00',
        endTime: '13:00', // End earlier than start
      };
      const result = breakIntervalSchema.safeParse(invalidBreak);
      expect(result.success).toBe(false);
    });

    it('should reject non-IST timezone configuration', () => {
      const invalidTzConfig = {
        ...DEFAULT_LAWYER_AVAILABILITY_CONFIG,
        timezone: 'America/New_York',
      };
      const result = lawyerAvailabilityConfigSchema.safeParse(invalidTzConfig);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain('Asia/Kolkata');
      }
    });

    it('should validate slot reservation requests', () => {
      const validReq = {
        lawyerUid: 'lawyer-123',
        date: '2026-09-15',
        slotId: '10:00-11:00',
        clientUid: 'client-456',
      };
      expect(slotReservationRequestSchema.safeParse(validReq).success).toBe(true);
    });
  });

  describe('Time-Slot Generation Algorithm', () => {
    it('should generate 60-min slots for standard Monday working hours excluding lunch recess and notice period', () => {
      // Early morning at 07:00 AM IST (well before 10:00 AM start + 2hr notice)
      const earlyMorningNow = new Date('2026-09-14T07:00:00+05:30');
      const summary = generateDateSlots(
        DEFAULT_LAWYER_AVAILABILITY_CONFIG,
        '2026-09-14', // Monday
        [],
        earlyMorningNow
      );

      expect(summary.isWorkingDay).toBe(true);
      expect(summary.isBlocked).toBe(false);

      // Working hours 10:00 - 19:00 = 9 hours => 9 total 1-hour slots
      expect(summary.totalSlotCount).toBe(9);

      // Lunch break 13:00 - 14:00 is marked unavailable
      const lunchSlot = summary.slots.find((s) => s.id === '13:00-14:00');
      expect(lunchSlot).toBeDefined();
      expect(lunchSlot?.isAvailable).toBe(false);
      expect(lunchSlot?.reason).toBe('break');
      expect(lunchSlot?.breakLabel).toContain('Lunch');

      // Remaining 8 slots should all be available with 3hr advance notice
      expect(summary.availableSlotCount).toBe(8);
      const morningSlot = summary.slots.find((s) => s.id === '10:00-11:00');
      expect(morningSlot?.isAvailable).toBe(true);
    });

    it('should enforce 2-hour minimum notice period on same-day bookings', () => {
      // 09:00 AM IST -> 10:00-11:00 AM slot is within 2 hours notice
      const summary = generateDateSlots(
        DEFAULT_LAWYER_AVAILABILITY_CONFIG,
        '2026-09-14',
        [],
        fixedNow
      );

      const slot10am = summary.slots.find((s) => s.id === '10:00-11:00');
      expect(slot10am?.isAvailable).toBe(false);
      expect(slot10am?.reason).toBe('notice_period');

      const slot11am = summary.slots.find((s) => s.id === '11:00-12:00');
      expect(slot11am?.isAvailable).toBe(true);
      expect(summary.availableSlotCount).toBe(7);
    });


    it('should return empty slots for closed Sundays', () => {
      const summary = generateDateSlots(
        DEFAULT_LAWYER_AVAILABILITY_CONFIG,
        '2026-09-20', // Sunday
        [],
        fixedNow
      );

      expect(summary.isWorkingDay).toBe(false);
      expect(summary.availableSlotCount).toBe(0);
      expect(summary.slots.length).toBe(0);
    });

    it('should block dates configured in blockedDates (e.g. Bombay High Court Recess)', () => {
      const configWithBlocked = {
        ...DEFAULT_LAWYER_AVAILABILITY_CONFIG,
        blockedDates: [
          {
            id: 'b1',
            date: '2026-09-16',
            reason: 'Bombay High Court Vacation',
            createdAt: '2026-09-01T00:00:00Z',
          },
        ],
      };

      const summary = generateDateSlots(configWithBlocked, '2026-09-16', [], fixedNow);

      expect(summary.isBlocked).toBe(true);
      expect(summary.blockedReason).toBe('Bombay High Court Vacation');
      expect(summary.availableSlotCount).toBe(0);
    });

    it('should apply special custom date overrides', () => {
      const configWithSpecial = {
        ...DEFAULT_LAWYER_AVAILABILITY_CONFIG,
        specialDates: [
          {
            id: 's1',
            date: '2026-09-20', // Sunday with special morning session
            isAvailable: true,
            startTime: '10:00',
            endTime: '12:00',
            note: 'Special Sunday Title Verification Session',
          },
        ],
      };

      const summary = generateDateSlots(configWithSpecial, '2026-09-20', [], fixedNow);

      expect(summary.isWorkingDay).toBe(true);
      expect(summary.totalSlotCount).toBe(2);
      expect(summary.availableSlotCount).toBe(2);
      expect(summary.slots[0].id).toBe('10:00-11:00');
      expect(summary.slots[1].id).toBe('11:00-12:00');
    });

    it('should reject past dates and dates beyond advance booking limit', () => {
      const pastSummary = generateDateSlots(
        DEFAULT_LAWYER_AVAILABILITY_CONFIG,
        '2026-09-01', // Past
        [],
        fixedNow
      );
      expect(pastSummary.isBlocked).toBe(true);
      expect(pastSummary.blockedReason).toContain('Past dates');

      const farFutureSummary = generateDateSlots(
        DEFAULT_LAWYER_AVAILABILITY_CONFIG,
        '2026-12-01', // 78 days in future with 30-day limit
        [],
        fixedNow
      );
      expect(farFutureSummary.isBlocked).toBe(true);
      expect(farFutureSummary.blockedReason).toContain('advance');
    });

    it('should generate multi-day range availability for calendar preview', () => {
      const range = generateDateRangeAvailability(
        DEFAULT_LAWYER_AVAILABILITY_CONFIG,
        7,
        [],
        fixedNow
      );

      expect(range.length).toBe(7);
      expect(range[0].date).toBe('2026-09-14');
      expect(range[6].date).toBe('2026-09-20');
    });
  });

  describe('Double-Booking Prevention & Concurrency Protection', () => {
    it('should mark already booked slots as unavailable in slot calculation', () => {
      const existingBookings = [
        {
          preferredTimeSlot: '11:00-12:00',
          status: 'confirmed',
        },
      ];

      const summary = generateDateSlots(
        DEFAULT_LAWYER_AVAILABILITY_CONFIG,
        '2026-09-14',
        existingBookings,
        fixedNow
      );

      const bookedSlot = summary.slots.find((s) => s.id === '11:00-12:00');
      expect(bookedSlot?.isAvailable).toBe(false);
      expect(bookedSlot?.reason).toBe('booked');
    });

    it('should release slot if booking was cancelled', () => {
      const cancelledBookings = [
        {
          preferredTimeSlot: '11:00-12:00',
          status: 'cancelled_by_client',
        },
      ];

      const summary = generateDateSlots(
        DEFAULT_LAWYER_AVAILABILITY_CONFIG,
        '2026-09-14',
        cancelledBookings,
        fixedNow
      );

      const slot = summary.slots.find((s) => s.id === '11:00-12:00');
      expect(slot?.isAvailable).toBe(true);
    });

    it('should atomically reserve a slot and prevent concurrent double booking by another client', async () => {
      const resA = await reserveBookingSlot({
        lawyerUid: 'lawyer-concurrent-1',
        date: '2026-09-15',
        slotId: '15:00-16:00',
        clientUid: 'client-A',
      });

      expect(resA.success).toBe(true);
      expect(resA.reservation?.status).toBe('confirmed');

      // Client B attempts to reserve the exact same slot
      const resB = await reserveBookingSlot({
        lawyerUid: 'lawyer-concurrent-1',
        date: '2026-09-15',
        slotId: '15:00-16:00',
        clientUid: 'client-B',
      });

      expect(resB.success).toBe(false);
      expect(resB.error).toContain('already reserved or booked by another client');
    });
  });
});
