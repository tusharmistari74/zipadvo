import { BaseEntity } from './common';

export type LegalDocumentCategory =
  | 'sale_deed'
  | 'index_2'
  | 'encumbrance_certificate'
  | '7_12_extract'
  | 'property_card'
  | 'rera_allotment_letter'
  | 'share_certificate'
  | 'power_of_attorney'
  | 'kyc_sanad'
  | 'kyc_pan'
  | 'kyc_aadhaar'
  | 'other_supporting';

export type DocumentAccessLevel = 'confidential_client_lawyer' | 'admin_only' | 'public';

export interface DocumentAccessAuditEntry {
  accessedByUid: string;
  accessedAt: string;
  action: 'upload' | 'view_signed_url' | 'download' | 'delete';
  ipAddress?: string;
}

export interface LegalDocument extends BaseEntity {
  id: string;
  ownerUid: string;
  bookingId?: string;
  category: LegalDocumentCategory;
  originalFileName: string;
  fileSizeBytes: number;
  mimeType: 'application/pdf' | 'image/jpeg' | 'image/png';
  storagePath: string; // Firebase Cloud Storage path
  accessLevel: DocumentAccessLevel;
  auditTrail: DocumentAccessAuditEntry[];
  isArchived: boolean;
}
