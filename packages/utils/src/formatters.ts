import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Standard utility for combining Tailwind CSS class names safely.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Indian Rupees (INR) format (e.g. ₹299 or ₹1,50,000)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date in Indian English locale (e.g. 12 Sep 2026)
 */
export function formatDate(dateStringOrTimestamp: string | Date): string {
  const date = typeof dateStringOrTimestamp === 'string' ? new Date(dateStringOrTimestamp) : dateStringOrTimestamp;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Normalize Indian Phone Number to +91XXXXXXXXXX format
 */
export function normalizeIndianPhoneNumber(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return `+${digitsOnly}`;
  }
  return phone;
}
