import { z } from 'zod';

export const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB maximum allowed file size
export const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'] as const;

export const bookingDocumentTypeEnum = z.enum([
  'property_title_deed',
  'index_2',
  'encumbrance_certificate',
  '7_12_extract',
  'property_card',
  'rera_allotment_letter',
  'share_certificate',
  'power_of_attorney',
  'society_noc',
  'completed_legal_opinion',
  'draft_registration_deed',
  'court_pleading',
  'completed_deliverable',
  'other_client_document',
  // Backward compatibility legacy values
  'sale_deed',
  'kyc_sanad',
  'kyc_pan',
  'kyc_aadhaar',
  'other_supporting',
]);

export const legalDocumentCategoryEnum = bookingDocumentTypeEnum;

export const allowedMimeTypesEnum = z.enum([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
]);

export const documentStatusEnum = z.enum(['active', 'superseded', 'archived', 'deleted']);

export const documentScanStatusEnum = z.enum(['pending_scan', 'clean', 'quarantined', 'failed']);

export const uploadBookingDocumentSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  documentType: bookingDocumentTypeEnum,
  originalFilename: z
    .string()
    .min(1, 'Filename is required')
    .max(255)
    .refine((name) => {
      const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
      return ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number]);
    }, 'Unsupported file extension. Allowed formats: PDF, JPG, JPEG, PNG'),
  mimeType: allowedMimeTypesEnum,
  size: z
    .number()
    .int()
    .positive('File size must be greater than 0')
    .max(MAX_DOCUMENT_SIZE_BYTES, 'File size exceeds maximum limit of 5 MB (5,242,880 bytes)'),
  isCompletedDeliverable: z.boolean().optional().default(false),
  notes: z.string().max(500).optional(),
});

export const replaceBookingDocumentSchema = z.object({
  previousDocumentId: z.string().min(1, 'Previous document ID is required for replacement'),
  bookingId: z.string().min(1, 'Booking ID is required'),
  originalFilename: z
    .string()
    .min(1, 'Filename is required')
    .max(255)
    .refine((name) => {
      const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
      return ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number]);
    }, 'Unsupported file extension. Allowed formats: PDF, JPG, JPEG, PNG'),
  mimeType: allowedMimeTypesEnum,
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_DOCUMENT_SIZE_BYTES, 'File size exceeds maximum limit of 5 MB'),
  notes: z.string().max(500).optional(),
});

// Legacy schema alias
export const uploadDocumentMetadataSchema = z.object({
  category: legalDocumentCategoryEnum,
  originalFileName: z.string().min(1).max(255),
  mimeType: z.enum(['application/pdf', 'image/jpeg', 'image/png']),
  fileSizeBytes: z
    .number()
    .int()
    .positive()
    .max(MAX_DOCUMENT_SIZE_BYTES, 'Max allowed file size is 5MB'),
  bookingId: z.string().optional(),
});

export type UploadBookingDocumentInput = z.infer<typeof uploadBookingDocumentSchema>;
export type ReplaceBookingDocumentInput = z.infer<typeof replaceBookingDocumentSchema>;
export type UploadDocumentMetadataInput = z.infer<typeof uploadDocumentMetadataSchema>;

/**
 * Validates file safety including extension, MIME type, size limit, and binary magic bytes
 */
export function validateFileSafety(file: {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  buffer?: Uint8Array;
}): { valid: boolean; error?: string } {
  // 1. Size check
  if (file.sizeBytes <= 0) {
    return { valid: false, error: 'File is empty (0 bytes).' };
  }
  if (file.sizeBytes > MAX_DOCUMENT_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed limit of 5 MB.`,
    };
  }

  // 2. Extension check
  const extMatch = file.filename.match(/\.([a-zA-Z0-9]+)$/);
  if (!extMatch || !extMatch[0]) {
    return { valid: false, error: 'File has no valid extension.' };
  }
  const ext = extMatch[0].toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
    return {
      valid: false,
      error: `Invalid file extension "${ext}". Supported extensions: .pdf, .jpg, .jpeg, .png`,
    };
  }

  // 3. MIME type check
  const allowedMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedMimes.includes(file.mimeType.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported MIME type "${file.mimeType}". Allowed: PDF, JPEG, PNG.`,
    };
  }

  // 4. Binary Magic Bytes Verification (if binary buffer is available)
  if (file.buffer && file.buffer.length >= 4) {
    const header = file.buffer.subarray(0, 8);

    // PDF magic bytes: %PDF- (0x25 0x50 0x44 0x46)
    if (file.mimeType === 'application/pdf' || ext === '.pdf') {
      const isPdf =
        header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46;
      if (!isPdf) {
        return {
          valid: false,
          error: 'Corrupted or forged PDF file. Header magic bytes do not match standard PDF specification.',
        };
      }
    }

    // JPEG magic bytes: 0xFF 0xD8 0xFF
    if (
      file.mimeType === 'image/jpeg' ||
      file.mimeType === 'image/jpg' ||
      ext === '.jpg' ||
      ext === '.jpeg'
    ) {
      const isJpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
      if (!isJpeg) {
        return {
          valid: false,
          error: 'Corrupted or forged JPEG image. Header magic bytes do not match JPEG specification.',
        };
      }
    }

    // PNG magic bytes: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
    if (file.mimeType === 'image/png' || ext === '.png') {
      const isPng =
        header[0] === 0x89 &&
        header[1] === 0x50 &&
        header[2] === 0x4e &&
        header[3] === 0x47;
      if (!isPng) {
        return {
          valid: false,
          error: 'Corrupted or forged PNG image. Header magic bytes do not match PNG specification.',
        };
      }
    }
  }

  return { valid: true };
}
