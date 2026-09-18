import { z } from 'zod';

export const platformSettingsSchema = z.object({
  commissionRate: z
    .number({ invalid_type_error: 'Commission rate must be a number' })
    .min(0, 'Commission rate cannot be negative')
    .max(100, 'Commission rate cannot exceed 100%'),
  unlockFee: z
    .number({ invalid_type_error: 'Unlock fee must be a number' })
    .min(0, 'Unlock fee cannot be negative')
    .max(50000, 'Unlock fee cannot exceed maximum allowable limit (₹50,000)'),
  minimumWithdrawal: z
    .number({ invalid_type_error: 'Minimum withdrawal amount must be a number' })
    .min(0, 'Minimum withdrawal amount cannot be negative')
    .max(1000000, 'Minimum withdrawal amount cannot exceed ₹10,00,000'),
  supportEmail: z
    .string({ invalid_type_error: 'Support email is required' })
    .email('Please provide a valid support email address'),
  supportPhone: z
    .string({ invalid_type_error: 'Support phone is required' })
    .min(8, 'Phone number must be at least 8 characters')
    .max(25, 'Phone number cannot exceed 25 characters')
    .regex(/^[+0-9\s\-()]+$/, 'Invalid phone number format'),
  platformVersion: z
    .string({ invalid_type_error: 'Platform version is required' })
    .min(1, 'Platform version cannot be empty')
    .max(20, 'Platform version cannot exceed 20 characters'),
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().max(500).optional(),
  reason: z
    .string()
    .min(3, 'Audit reason must be at least 3 characters')
    .max(500, 'Audit reason cannot exceed 500 characters')
    .optional(),
});

export const updatePlatformSettingsSchema = z.object({
  commissionRate: z
    .number({ invalid_type_error: 'Commission rate must be a number' })
    .min(0, 'Commission rate cannot be negative')
    .max(100, 'Commission rate cannot exceed 100%')
    .optional(),
  unlockFee: z
    .number({ invalid_type_error: 'Unlock fee must be a number' })
    .min(0, 'Unlock fee cannot be negative')
    .max(50000, 'Unlock fee cannot exceed maximum allowable limit (₹50,000)')
    .optional(),
  minimumWithdrawal: z
    .number({ invalid_type_error: 'Minimum withdrawal amount must be a number' })
    .min(0, 'Minimum withdrawal amount cannot be negative')
    .max(1000000, 'Minimum withdrawal amount cannot exceed ₹10,00,000')
    .optional(),
  supportEmail: z
    .string({ invalid_type_error: 'Support email is required' })
    .email('Please provide a valid support email address')
    .optional(),
  supportPhone: z
    .string({ invalid_type_error: 'Support phone is required' })
    .min(8, 'Phone number must be at least 8 characters')
    .max(25, 'Phone number cannot exceed 25 characters')
    .regex(/^[+0-9\s\-()]+$/, 'Invalid phone number format')
    .optional(),
  platformVersion: z
    .string({ invalid_type_error: 'Platform version is required' })
    .min(1, 'Platform version cannot be empty')
    .max(20, 'Platform version cannot exceed 20 characters')
    .optional(),
  maintenanceMode: z.boolean().optional(),
  isMaintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().max(500).optional(),
  // Legacy aliases
  consultationUnlockFeeInr: z.number().min(0, 'Unlock fee cannot be negative').max(50000).optional(),
  platformCommissionPercentage: z.number().min(0, 'Commission rate cannot be negative').max(100, 'Commission rate cannot exceed 100%').optional(),
  supportContactEmail: z.string().email('Please provide a valid support email address').optional(),
  supportContactPhone: z.string().min(8).max(25).optional(),
  reason: z
    .string()
    .min(3, 'Audit reason must be at least 3 characters')
    .max(500, 'Audit reason cannot exceed 500 characters')
    .optional(),
});

export type PlatformSettingsInput = z.infer<typeof platformSettingsSchema>;
export type UpdatePlatformSettingsInput = z.infer<typeof updatePlatformSettingsSchema>;
