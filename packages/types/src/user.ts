import { BaseEntity, MumbaiAddress } from './common';
import { UserRole } from './auth';

export type UserStatus = 'active' | 'suspended' | 'deactivated';

export interface UserProfile extends BaseEntity {
  uid: string;
  email?: string;
  phoneNumber: string; // Indian E.164 phone (+91XXXXXXXXXX)
  fullName: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  address?: MumbaiAddress;
  preferredLanguage?: 'English' | 'Hindi' | 'Marathi';
  lastLoginAt?: string;
}
