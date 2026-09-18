import { BaseEntity } from './common';

export type BookingDocumentType =
  | 'property_title_deed'
  | 'index_2'
  | 'encumbrance_certificate'
  | '7_12_extract'
  | 'property_card'
  | 'rera_allotment_letter'
  | 'share_certificate'
  | 'power_of_attorney'
  | 'society_noc'
  | 'completed_legal_opinion'
  | 'draft_registration_deed'
  | 'court_pleading'
  | 'completed_deliverable'
  | 'other_client_document'
  | 'sale_deed'
  | 'kyc_sanad'
  | 'kyc_pan'
  | 'kyc_aadhaar'
  | 'other_supporting';

export type LegalDocumentCategory = BookingDocumentType;

export type DocumentMimeType =
  | 'application/pdf'
  | 'image/jpeg'
  | 'image/jpg'
  | 'image/png';

export type DocumentStatus = 'active' | 'superseded' | 'archived' | 'deleted';

export type DocumentScanStatus = 'pending_scan' | 'clean' | 'quarantined' | 'failed';

export type DocumentAccessLevel = 'confidential_client_lawyer' | 'admin_only' | 'public';

export type DocumentAuditAction =
  | 'upload'
  | 'access_download'
  | 'view_signed_url'
  | 'replace'
  | 'mark_completed'
  | 'delete'
  | 'scan_clean'
  | 'scan_quarantine';

export interface DocumentAuditEvent {
  id: string;
  documentId: string;
  bookingId: string;
  actorUid: string;
  actorRole: 'client' | 'lawyer' | 'admin' | 'super_admin' | 'system';
  action: DocumentAuditAction;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
}

export interface DocumentAccessAuditEntry {
  accessedByUid: string;
  accessedAt: string;
  action: 'upload' | 'view_signed_url' | 'download' | 'delete' | 'replace';
  ipAddress?: string;
}

/**
 * Standard Booking Document Entity stored in Firestore
 */
export interface BookingDocument extends BaseEntity {
  documentId: string; // Canonical identifier matching id
  id: string;
  bookingId: string;
  uploadedBy: string; // User/Lawyer UID
  uploaderRole: 'client' | 'lawyer' | 'admin' | 'super_admin' | 'system';
  documentType: BookingDocumentType;
  originalFilename: string;
  originalFileName?: string; // Alias for backward compatibility
  mimeType: DocumentMimeType;
  size: number; // File size in bytes (max 5MB)
  fileSizeBytes?: number; // Alias for backward compatibility
  storagePath: string; // Private Firebase Cloud Storage path
  status: DocumentStatus;
  scanStatus: DocumentScanStatus;
  version: number; // Version 1, 2, 3...
  replacedDocumentId?: string; // If this supersedes an earlier documentId
  isCompletedDeliverable?: boolean; // True if uploaded by advocate as final deliverable
  checksum?: string; // SHA-256 or MD5 hash for integrity
  accessLevel?: DocumentAccessLevel;
  auditTrail?: DocumentAccessAuditEntry[];
  isArchived?: boolean;
}

// Backward compatibility alias
export type LegalDocument = BookingDocument;
