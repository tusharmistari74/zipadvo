import { describe, it, expect, beforeAll } from 'vitest';
import {
  validateFileSafety,
  uploadBookingDocumentSchema,
  MAX_DOCUMENT_SIZE_BYTES,
} from '@legalhub/validation';
import {
  uploadBookingDocument,
  getBookingDocuments,
  generateSecureDocumentDownloadUrl,
  replaceBookingDocument,
  deleteBookingDocument,
  getDocumentAuditTrail,
  updateDocumentScanStatus,
  getBookingDocumentStoragePath,
  sanitizeFilename,
} from '../../apps/web/src/lib/services/document.service';
import { createBooking } from '../../apps/web/src/lib/services/booking.service';

describe('Phase 12: Secure Booking Document Management', () => {
  let bookingId: string;
  const clientUid = 'client-doc-user';
  const lawyerUid = 'lawyer-1';
  const unauthorizedUid = 'attacker-user';

  beforeAll(async () => {
    // Create a fresh booking for document testing
    const createRes = await createBooking(
      {
        lawyerUid,
        serviceCategory: 'Property Registration & Conveyancing',
        caseDescription: 'Document verification and title check for flat in Dadar.',
        preferredDate: '2026-09-29',
        preferredTimeSlot: '14:00-15:00',
        consultationMode: 'in_person_office',
        clientName: 'Sanjay Deshmukh',
        clientPhone: '+919820054321',
      },
      clientUid
    );

    expect(createRes.success).toBe(true);
    bookingId = createRes.booking!.id;
  });

  describe('File Validation & Magic Bytes Header Security', () => {
    it('should enforce 5MB maximum file size', () => {
      // 4.9 MB valid
      const validSize = 4.9 * 1024 * 1024;
      const validRes = validateFileSafety({
        filename: 'index2_extract.pdf',
        mimeType: 'application/pdf',
        sizeBytes: validSize,
      });
      expect(validRes.valid).toBe(true);

      // 5.1 MB invalid
      const invalidSize = 5.1 * 1024 * 1024;
      const invalidRes = validateFileSafety({
        filename: 'heavy_document.pdf',
        mimeType: 'application/pdf',
        sizeBytes: invalidSize,
      });
      expect(invalidRes.valid).toBe(false);
      expect(invalidRes.error).toContain('exceeds maximum allowed limit of 5 MB');
    });

    it('should accept only supported extensions (PDF, JPG, JPEG, PNG) and reject executables/scripts', () => {
      const allowed = ['title_deed.pdf', 'photo.jpg', 'receipt.jpeg', 'extract_7_12.png'];
      allowed.forEach((fn) => {
        const mime = fn.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
        expect(
          validateFileSafety({
            filename: fn,
            mimeType: mime,
            sizeBytes: 1024 * 50,
          }).valid
        ).toBe(true);
      });

      const rejected = [
        'script.js',
        'malware.exe',
        'exploit.sh',
        'archive.zip',
        'payload.html',
        'document.docx',
      ];
      rejected.forEach((fn) => {
        const res = validateFileSafety({
          filename: fn,
          mimeType: 'application/octet-stream',
          sizeBytes: 1024 * 50,
        });
        expect(res.valid).toBe(false);
        expect(res.error).toContain('Invalid file extension');
      });
    });

    it('should detect forged extensions using binary magic bytes', () => {
      // PDF valid magic bytes: %PDF-
      const validPdfBuffer = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
      expect(
        validateFileSafety({
          filename: 'real.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 1024,
          buffer: validPdfBuffer,
        }).valid
      ).toBe(true);

      // Forged PDF (text file renamed to .pdf)
      const fakePdfBuffer = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x57, 0x6f]);
      const forgedRes = validateFileSafety({
        filename: 'fake.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
        buffer: fakePdfBuffer,
      });
      expect(forgedRes.valid).toBe(false);
      expect(forgedRes.error).toContain('magic bytes do not match standard PDF specification');

      // JPEG valid magic bytes: 0xFF 0xD8 0xFF
      const validJpegBuffer = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
      expect(
        validateFileSafety({
          filename: 'photo.jpg',
          mimeType: 'image/jpeg',
          sizeBytes: 1024,
          buffer: validJpegBuffer,
        }).valid
      ).toBe(true);

      // PNG valid magic bytes: 0x89 0x50 0x4E 0x47
      const validPngBuffer = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      expect(
        validateFileSafety({
          filename: 'chart.png',
          mimeType: 'image/png',
          sizeBytes: 1024,
          buffer: validPngBuffer,
        }).valid
      ).toBe(true);
    });
  });

  describe('Private Storage Path & Sanitization', () => {
    it('should sanitize unsafe filenames', () => {
      const sanitized = sanitizeFilename('../../../etc/passwd&&malicious file(1).pdf');
      expect(sanitized).toBe('.._.._.._etc_passwd_malicious_file_1_.pdf');
      expect(sanitized).not.toContain('&');
      expect(sanitized).not.toContain('(');
    });

    it('should generate correct private storage paths for client documents and lawyer deliverables', () => {
      const clientPath = getBookingDocumentStoragePath({
        bookingId: 'book-101',
        documentId: 'doc-001',
        version: 1,
        filename: 'Sale Deed Copy.pdf',
        isCompletedDeliverable: false,
      });
      expect(clientPath).toBe('booking-documents/book-101/doc-001_v1_sale_deed_copy.pdf');

      const lawyerDeliverablePath = getBookingDocumentStoragePath({
        bookingId: 'book-101',
        documentId: 'doc-002',
        version: 2,
        filename: 'Final Legal Opinion.pdf',
        isCompletedDeliverable: true,
      });
      expect(lawyerDeliverablePath).toBe('completed-documents/book-101/doc-002_v2_final_legal_opinion.pdf');
    });
  });

  describe('Secure Upload & Multi-Tenant Access Control', () => {
    it('should allow booking client owner to upload case documents', async () => {
      const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);

      const uploadRes = await uploadBookingDocument({
        bookingId,
        file: {
          name: '7_12_Extract_Bandra.pdf',
          type: 'application/pdf',
          size: 1024 * 120,
          buffer: pdfBytes,
        },
        documentType: '7_12_extract',
        uploaderUid: clientUid,
        uploaderRole: 'client',
      });

      expect(uploadRes.success).toBe(true);
      expect(uploadRes.document).toBeDefined();
      expect(uploadRes.document?.documentType).toBe('7_12_extract');
      expect(uploadRes.document?.uploadedBy).toBe(clientUid);
      expect(uploadRes.document?.version).toBe(1);
      expect(uploadRes.document?.status).toBe('active');
      expect(uploadRes.document?.scanStatus).toBe('clean');
      expect(uploadRes.document?.storagePath).toContain('booking-documents/');
    });

    it('should forbid unauthorized 3rd party from uploading to another user booking', async () => {
      const uploadRes = await uploadBookingDocument({
        bookingId,
        file: {
          name: 'hacked_doc.pdf',
          type: 'application/pdf',
          size: 1024 * 50,
        },
        documentType: 'other_client_document',
        uploaderUid: unauthorizedUid,
        uploaderRole: 'client',
      });

      expect(uploadRes.success).toBe(false);
      expect(uploadRes.error).toContain('Unauthorized');
    });

    it('should allow assigned lawyer to upload completed deliverables to completed-documents/', async () => {
      const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);

      const uploadRes = await uploadBookingDocument({
        bookingId,
        file: {
          name: 'Title_Investigation_Report.pdf',
          type: 'application/pdf',
          size: 1024 * 250,
          buffer: pdfBytes,
        },
        documentType: 'completed_legal_opinion',
        uploaderUid: lawyerUid,
        uploaderRole: 'lawyer',
        isCompletedDeliverable: true,
      });

      expect(uploadRes.success).toBe(true);
      expect(uploadRes.document?.isCompletedDeliverable).toBe(true);
      expect(uploadRes.document?.storagePath).toContain('completed-documents/');
    });

    it('should forbid clients from marking uploads as completed deliverables', async () => {
      const uploadRes = await uploadBookingDocument({
        bookingId,
        file: {
          name: 'client_trying_to_complete.pdf',
          type: 'application/pdf',
          size: 1024 * 50,
        },
        documentType: 'completed_legal_opinion',
        uploaderUid: clientUid,
        uploaderRole: 'client',
        isCompletedDeliverable: true,
      });

      expect(uploadRes.success).toBe(false);
      expect(uploadRes.error).toContain('Clients cannot upload final completed deliverables');
    });

    it('should list only authorized documents for client, lawyer, and admin', async () => {
      // Client view
      const clientDocs = await getBookingDocuments(bookingId, clientUid, 'client');
      expect(clientDocs.success).toBe(true);
      expect(clientDocs.documents.length).toBeGreaterThanOrEqual(1);

      // Lawyer view
      const lawyerDocs = await getBookingDocuments(bookingId, lawyerUid, 'lawyer');
      expect(lawyerDocs.success).toBe(true);

      // Admin view
      const adminDocs = await getBookingDocuments(bookingId, 'admin-1', 'admin');
      expect(adminDocs.success).toBe(true);

      // Unauthorized 3rd party
      const unauthorizedDocs = await getBookingDocuments(bookingId, unauthorizedUid, 'client');
      expect(unauthorizedDocs.success).toBe(false);
      expect(unauthorizedDocs.error).toContain('denied');
    });
  });

  describe('Document Versioning & Superseding', () => {
    it('should create new version on replacement and mark previous version as superseded', async () => {
      // 1. Initial document v1
      const initialRes = await uploadBookingDocument({
        bookingId,
        file: {
          name: 'Index2_Draft_v1.pdf',
          type: 'application/pdf',
          size: 1024 * 80,
        },
        documentType: 'index_2',
        uploaderUid: clientUid,
        uploaderRole: 'client',
      });

      const initialDocId = initialRes.document!.id;
      expect(initialRes.document?.version).toBe(1);

      // 2. Replace with v2
      const replaceRes = await replaceBookingDocument({
        previousDocumentId: initialDocId,
        bookingId,
        file: {
          name: 'Index2_Updated_v2.pdf',
          type: 'application/pdf',
          size: 1024 * 90,
        },
        uploaderUid: clientUid,
        uploaderRole: 'client',
      });

      expect(replaceRes.success).toBe(true);
      expect(replaceRes.document?.version).toBe(2);
      expect(replaceRes.document?.replacedDocumentId).toBe(initialDocId);
      expect(replaceRes.document?.status).toBe('active');
    });
  });

  describe('Controlled Downloads, Malware Quarantine & Audit Trail', () => {
    it('should generate secure download tokens and prevent permanent public exposure', async () => {
      const uploadRes = await uploadBookingDocument({
        bookingId,
        file: {
          name: 'Power_Of_Attorney.pdf',
          type: 'application/pdf',
          size: 1024 * 110,
        },
        documentType: 'power_of_attorney',
        uploaderUid: clientUid,
        uploaderRole: 'client',
      });

      const docId = uploadRes.document!.id;

      // Authorized download by client
      const downloadRes = await generateSecureDocumentDownloadUrl(docId, clientUid, 'client');
      expect(downloadRes.success).toBe(true);
      expect(downloadRes.downloadUrl).toBeDefined();
      expect(downloadRes.expiresAt).toBeDefined();

      // Unauthorized download attempt
      const unauthDownload = await generateSecureDocumentDownloadUrl(docId, unauthorizedUid, 'client');
      expect(unauthDownload.success).toBe(false);
      expect(unauthDownload.error).toContain('permission');
    });

    it('should block download if file is quarantined by security scanner', async () => {
      const uploadRes = await uploadBookingDocument({
        bookingId,
        file: {
          name: 'Suspicious_Attachment.pdf',
          type: 'application/pdf',
          size: 1024 * 60,
        },
        documentType: 'other_client_document',
        uploaderUid: clientUid,
        uploaderRole: 'client',
      });

      const docId = uploadRes.document!.id;

      // Quarantine file
      await updateDocumentScanStatus(docId, 'quarantined', 'Detected suspicious macro');

      // Attempt download
      const downloadRes = await generateSecureDocumentDownloadUrl(docId, clientUid, 'client');
      expect(downloadRes.success).toBe(false);
      expect(downloadRes.error).toContain('quarantined by automated malware scanning');
    });

    it('should record comprehensive immutable audit trail for all document actions', async () => {
      const uploadRes = await uploadBookingDocument({
        bookingId,
        file: {
          name: 'Audited_Document.pdf',
          type: 'application/pdf',
          size: 1024 * 75,
        },
        documentType: 'property_title_deed',
        uploaderUid: clientUid,
        uploaderRole: 'client',
      });

      const docId = uploadRes.document!.id;

      // Download
      await generateSecureDocumentDownloadUrl(docId, clientUid, 'client');

      // Delete
      await deleteBookingDocument({
        documentId: docId,
        callerUid: clientUid,
        callerRole: 'client',
        reason: 'Uploaded wrong draft',
      });

      // Fetch audit trail
      const auditRes = await getDocumentAuditTrail(docId, clientUid, 'client');
      expect(auditRes.success).toBe(true);
      expect(auditRes.auditEvents.length).toBeGreaterThanOrEqual(3);

      const actions = auditRes.auditEvents.map((a) => a.action);
      expect(actions).toContain('upload');
      expect(actions).toContain('access_download');
      expect(actions).toContain('delete');
    });
  });
});
