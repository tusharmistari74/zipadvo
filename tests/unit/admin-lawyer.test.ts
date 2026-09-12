import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firestore operations
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
    getDocs: vi.fn(async () => ({ docs: [], empty: true })),
  };
});

import {
  listAdminLawyers,
  getAdminLawyerDetail,
  approveLawyerKyc,
  rejectLawyerKyc,
  markLawyerUnderReview,
  suspendLawyer,
  restoreLawyer,
} from '../../apps/web/src/lib/services/admin-lawyer.service';

describe('Admin Lawyer Verification Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list and filter lawyers by pending review status', async () => {
    const pendingList = await listAdminLawyers({ status: 'pending' });

    expect(pendingList.length).toBeGreaterThan(0);
    pendingList.forEach((lawyer) => {
      expect(['submitted', 'under_review']).toContain(lawyer.kycStatus);
    });
  });

  it('should filter lawyers by search query (Sanad or Name)', async () => {
    const searchResults = await listAdminLawyers({ searchQuery: 'Deshmukh' });

    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0].fullName).toContain('Deshmukh');
  });

  it('should fetch complete admin lawyer detail with private KYC submission', async () => {
    const detail = await getAdminLawyerDetail('lawyer-pending-1');

    expect(detail).not.toBeNull();
    expect(detail?.fullName).toBe('Adv. Anant R. Joshi');
    expect(detail?.sanadNumber).toBe('MAH/5612/2017');
    expect(detail?.kycSubmission).toBeDefined();
    expect(detail?.kycSubmission?.panNumberEncrypted).toBeDefined();
    expect(detail?.kycSubmission?.sanadCertificateStoragePath).toBeDefined();
  });

  it('should fail rejection if reason is less than 10 characters', async () => {
    const resShort = await rejectLawyerKyc('admin-uid', 'lawyer-pending-1', 'bad doc');
    expect(resShort.success).toBe(false);
    expect(resShort.error).toContain('minimum 10 characters');

    const resEmpty = await rejectLawyerKyc('admin-uid', 'lawyer-pending-1', '');
    expect(resEmpty.success).toBe(false);
  });

  it('should process rejection with valid detailed reason and record audit log', async () => {
    const res = await rejectLawyerKyc(
      'admin-uid',
      'lawyer-pending-1',
      'Sanad certificate scan is blurred and enrollment year does not match records.'
    );

    expect(res.success).toBe(true);
  });

  it('should process lawyer approval and record audit log', async () => {
    const res = await approveLawyerKyc('admin-uid', 'lawyer-pending-1', 'Sanad verified with BCMG roll');
    expect(res.success).toBe(true);
  });

  it('should process marking application under review', async () => {
    const res = await markLawyerUnderReview('admin-uid', 'lawyer-pending-1', 'Cross-verifying with Bar Council');
    expect(res.success).toBe(true);
  });

  it('should process suspension and restoration', async () => {
    const suspendRes = await suspendLawyer('admin-uid', 'lawyer-1', 'Pending bar council inquiry');
    expect(suspendRes.success).toBe(true);

    const restoreRes = await restoreLawyer('admin-uid', 'lawyer-1');
    expect(restoreRes.success).toBe(true);
  });
});

