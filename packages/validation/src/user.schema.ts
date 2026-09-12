import { z } from 'zod';

export const mumbaiPincodeRegex = /^400[0-9]{3}$|^401[0-9]{3}$/;
export const indianPhoneRegex = /^\+91[6-9]\d{9}$/;

export const mumbaiAddressSchema = z.object({
  line1: z.string().min(3, 'Address line 1 must be at least 3 characters'),
  line2: z.string().optional(),
  area: z.string().min(2, 'Area name is required'),
  city: z.enum(['Mumbai', 'Navi Mumbai', 'Thane']),
  pincode: z.string().regex(mumbaiPincodeRegex, 'Must be a valid 6-digit Mumbai MMR PIN code (e.g. 400001)'),
  state: z.literal('Maharashtra'),
  country: z.literal('India'),
  landmark: z.string().optional(),
});

export const userProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phoneNumber: z.string().regex(indianPhoneRegex, 'Must be a valid Indian mobile number (+91XXXXXXXXXX)'),
  email: z.string().email('Invalid email address').optional(),
  role: z.enum(['client', 'lawyer', 'admin', 'super_admin']),
  address: mumbaiAddressSchema.optional(),
  preferredLanguage: z.enum(['English', 'Hindi', 'Marathi']).default('English'),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
