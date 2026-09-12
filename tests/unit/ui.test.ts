import { describe, it, expect } from 'vitest';

describe('Design System Primitives Logic', () => {
  it('should extract avatar initials correctly', () => {
    const getInitials = (fullName?: string) => {
      if (!fullName) return 'LH';
      const parts = fullName.trim().split(/\s+/);
      if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() || 'LH';
      return `${parts[0]?.[0] || ''}${parts[parts.length - 1]?.[0] || ''}`.toUpperCase();
    };

    expect(getInitials('Rajesh Mehta')).toBe('RM');
    expect(getInitials('Advocate Priya Deshmukh')).toBe('AD');
    expect(getInitials('Suresh')).toBe('SU');
    expect(getInitials('')).toBe('LH');
  });

  it('should compute status badge variants accurately', () => {
    const getVariant = (status: string) => {
      switch (status) {
        case 'verified':
        case 'completed':
        case 'captured':
          return 'success';
        case 'pending_unlock_payment':
        case 'submitted':
        case 'under_review':
          return 'warning';
        case 'unlocked':
        case 'accepted':
        case 'in_progress':
          return 'brand';
        case 'rejected':
        case 'failed':
        case 'disputed':
          return 'error';
        default:
          return 'default';
      }
    };

    expect(getVariant('verified')).toBe('success');
    expect(getVariant('pending_unlock_payment')).toBe('warning');
    expect(getVariant('unlocked')).toBe('brand');
    expect(getVariant('rejected')).toBe('error');
    expect(getVariant('draft')).toBe('default');
  });
});
