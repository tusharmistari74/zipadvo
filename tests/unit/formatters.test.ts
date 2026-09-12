import { describe, it, expect } from 'vitest';
import {
  formatINR,
  normalizeIndianPhoneNumber,
  cn,
} from '../../packages/utils/src/formatters';

describe('Formatters & Utility Helpers', () => {
  it('should format Indian Rupee currency correctly', () => {
    const formatted = formatINR(299);
    expect(formatted).toContain('299');
  });

  it('should normalize Indian phone numbers to E.164 standard', () => {
    expect(normalizeIndianPhoneNumber('9876543210')).toBe('+919876543210');
    expect(normalizeIndianPhoneNumber('919876543210')).toBe('+919876543210');
    expect(normalizeIndianPhoneNumber('+919876543210')).toBe('+919876543210');
  });

  it('should merge tailwind class names properly', () => {
    const classes = cn('px-4 py-2', 'px-6', { 'bg-blue-600': true, 'bg-red-500': false });
    expect(classes).toBe('py-2 px-6 bg-blue-600');
  });
});
