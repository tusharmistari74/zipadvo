import { z } from 'zod';
import { indianPhoneRegex } from './user.schema';

export const emailLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const emailRegisterSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    phoneNumber: z.string().regex(indianPhoneRegex, 'Must be a valid Indian mobile number (+91XXXXXXXXXX)'),
    password: z.string().min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    accountType: z.enum(['client', 'lawyer']).default('client'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const phoneOtpRequestSchema = z.object({
  phoneNumber: z.string().regex(indianPhoneRegex, 'Must be a valid Indian mobile number (+91XXXXXXXXXX)'),
});

export const phoneOtpVerifySchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type EmailLoginInput = z.infer<typeof emailLoginSchema>;
export type EmailRegisterInput = z.infer<typeof emailRegisterSchema>;
export type PhoneOtpRequestInput = z.infer<typeof phoneOtpRequestSchema>;
export type PhoneOtpVerifyInput = z.infer<typeof phoneOtpVerifySchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
