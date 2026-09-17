import { z } from 'zod';

// Regex for 24-hour time "HH:mm" (00:00 to 23:59)
export const time24Regex = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Regex for ISO Date "YYYY-MM-DD"
export const isoDateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

/**
 * Break / Recess Interval Schema
 */
export const breakIntervalSchema = z
  .object({
    id: z.string().min(1, 'Break ID is required'),
    label: z.string().min(2, 'Break description is required').max(100),
    startTime: z.string().regex(time24Regex, 'Start time must be in HH:mm format'),
    endTime: z.string().regex(time24Regex, 'End time must be in HH:mm format'),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'Break start time must be earlier than end time',
    path: ['endTime'],
  });

export type BreakIntervalInput = z.infer<typeof breakIntervalSchema>;

/**
 * Daily Working Schedule Schema
 */
export const dayScheduleSchema = z
  .object({
    dayOfWeek: z.union([
      z.literal(0),
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
      z.literal(6),
    ]),
    isAvailable: z.boolean(),
    startTime: z.string().regex(time24Regex, 'Start time must be in HH:mm format'),
    endTime: z.string().regex(time24Regex, 'End time must be in HH:mm format'),
    breaks: z.array(breakIntervalSchema).default([]),
  })
  .refine(
    (data) => {
      if (!data.isAvailable) return true;
      return data.startTime < data.endTime;
    },
    {
      message: 'Working start time must be earlier than end time',
      path: ['endTime'],
    }
  )
  .refine(
    (data) => {
      if (!data.isAvailable) return true;
      // Ensure all breaks are completely within working hours
      return data.breaks.every((b) => b.startTime >= data.startTime && b.endTime <= data.endTime);
    },
    {
      message: 'All breaks must be within working hours',
      path: ['breaks'],
    }
  );

export type DayScheduleInput = z.infer<typeof dayScheduleSchema>;

/**
 * Blocked Dates Schema (e.g. Bombay High Court Vacation, Public Holidays)
 */
export const blockedDateSchema = z.object({
  id: z.string().min(1, 'Blocked date ID is required'),
  date: z.string().regex(isoDateRegex, 'Date must be in YYYY-MM-DD format'),
  reason: z.string().min(2, 'Reason for blocking date is required').max(200),
  createdAt: z.string().datetime().optional(),
});

export type BlockedDateInput = z.infer<typeof blockedDateSchema>;

/**
 * Special Date Schedule Schema (Custom Hours on specific dates)
 */
export const specialDateScheduleSchema = z
  .object({
    id: z.string().min(1, 'Special date ID is required'),
    date: z.string().regex(isoDateRegex, 'Date must be in YYYY-MM-DD format'),
    isAvailable: z.boolean(),
    startTime: z.string().regex(time24Regex, 'Start time must be in HH:mm format').optional(),
    endTime: z.string().regex(time24Regex, 'End time must be in HH:mm format').optional(),
    breaks: z.array(breakIntervalSchema).optional().default([]),
    note: z.string().max(200).optional(),
  })
  .refine(
    (data) => {
      if (!data.isAvailable) return true;
      if (!data.startTime || !data.endTime) return false;
      return data.startTime < data.endTime;
    },
    {
      message: 'Special day working start time must be earlier than end time',
      path: ['endTime'],
    }
  );

export type SpecialDateScheduleInput = z.infer<typeof specialDateScheduleSchema>;

/**
 * Full Lawyer Availability Configuration Schema
 */
export const lawyerAvailabilityConfigSchema = z.object({
  timezone: z
    .string()
    .default('Asia/Kolkata')
    .refine((tz) => tz === 'Asia/Kolkata', {
      message: 'Initial platform timezone must be Asia/Kolkata for Mumbai legal services',
    }),
  slotDurationMinutes: z
    .number()
    .int()
    .min(15, 'Slot duration must be at least 15 minutes')
    .max(120, 'Slot duration cannot exceed 120 minutes')
    .default(60),
  bufferMinutes: z
    .number()
    .int()
    .min(0, 'Buffer cannot be negative')
    .max(60, 'Buffer cannot exceed 60 minutes')
    .default(0),
  advanceBookingDays: z
    .number()
    .int()
    .min(1, 'Advance booking window must be at least 1 day')
    .max(90, 'Advance booking cannot exceed 90 days')
    .default(30),
  minimumNoticeHours: z
    .number()
    .int()
    .min(0, 'Minimum notice hours cannot be negative')
    .max(48, 'Notice period cannot exceed 48 hours')
    .default(2),
  weeklySchedule: z
    .array(dayScheduleSchema)
    .min(7, 'Weekly schedule must define all 7 days of the week')
    .max(7, 'Weekly schedule must define exactly 7 days of the week'),
  blockedDates: z.array(blockedDateSchema).default([]),
  specialDates: z.array(specialDateScheduleSchema).default([]),
  updatedAt: z.string().datetime().optional(),
});

export type LawyerAvailabilityConfigInput = z.infer<typeof lawyerAvailabilityConfigSchema>;

/**
 * Slot Reservation Request Schema
 */
export const slotReservationRequestSchema = z.object({
  lawyerUid: z.string().min(1, 'Lawyer ID is required'),
  date: z.string().regex(isoDateRegex, 'Date must be in YYYY-MM-DD format'),
  slotId: z.string().min(3, 'Slot ID is required'), // e.g. "10:00-11:00"
  clientUid: z.string().min(1, 'Client ID is required'),
});

export type SlotReservationRequestInput = z.infer<typeof slotReservationRequestSchema>;
