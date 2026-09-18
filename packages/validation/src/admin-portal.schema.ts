import { z } from 'zod';

export const adminBlockUserSchema = z.object({
  action: z.enum(['block', 'unblock']),
  reason: z
    .string()
    .min(5, 'Reason must be at least 5 characters')
    .max(500, 'Reason cannot exceed 500 characters'),
});

export const adminBookingOverrideSchema = z.object({
  newStatus: z.enum([
    'draft',
    'pending_payment',
    'pending_lawyer',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'disputed',
  ]),
  reason: z
    .string()
    .min(5, 'Override reason must be at least 5 characters')
    .max(500, 'Override reason cannot exceed 500 characters'),
  adminNotes: z.string().max(1000).optional(),
});

export const adminResolveDisputeSchema = z.object({
  resolution: z.enum(['client_refund', 'lawyer_payout', 'dismissed']),
  resolutionSummary: z
    .string()
    .min(5, 'Resolution summary must be at least 5 characters')
    .max(1000),
  adminNotes: z.string().max(1000).optional(),
  refundAmountInr: z.number().min(0).max(100000).optional(),
});

export const adminPlatformSettingsUpdateSchema = z.object({
  commissionRate: z.number().min(0, 'Commission rate cannot be negative').max(100, 'Commission rate cannot exceed 100%').optional(),
  unlockFee: z.number().min(0, 'Unlock fee cannot be negative').max(50000).optional(),
  minimumWithdrawal: z.number().min(0, 'Minimum withdrawal cannot be negative').max(1000000).optional(),
  supportEmail: z.string().email('Please provide a valid support email address').optional(),
  supportPhone: z.string().min(8).max(25).optional(),
  platformVersion: z.string().min(1).max(20).optional(),
  consultationUnlockFeeInr: z.number().min(0, 'Unlock fee cannot be negative').max(50000).optional(),
  platformCommissionPercentage: z.number().min(0, 'Commission rate cannot be negative').max(100, 'Commission rate cannot exceed 100%').optional(),
  isMaintenanceMode: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
  supportContactEmail: z.string().email('Please provide a valid support email address').optional(),
  supportContactPhone: z.string().min(8).max(25).optional(),
  reason: z.string().min(3).max(500).optional(),
});

export type AdminBlockUserInput = z.infer<typeof adminBlockUserSchema>;
export type AdminBookingOverrideInput = z.infer<typeof adminBookingOverrideSchema>;
export type AdminResolveDisputeInput = z.infer<typeof adminResolveDisputeSchema>;
export type AdminPlatformSettingsUpdateInput = z.infer<typeof adminPlatformSettingsUpdateSchema>;
