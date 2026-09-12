import { z } from 'zod';

export const legalDocumentCategoryEnum = z.enum([
  'sale_deed',
  'index_2',
  'encumbrance_certificate',
  '7_12_extract',
  'property_card',
  'rera_allotment_letter',
  'share_certificate',
  'power_of_attorney',
  'kyc_sanad',
  'kyc_pan',
  'kyc_aadhaar',
  'other_supporting',
]);

export const uploadDocumentMetadataSchema = z.object({
  category: legalDocumentCategoryEnum,
  originalFileName: z.string().min(1).max(255),
  mimeType: z.enum(['application/pdf', 'image/jpeg', 'image/png']),
  fileSizeBytes: z.number().int().positive().max(25 * 1024 * 1024, 'Max allowed file size is 25MB'),
  bookingId: z.string().optional(),
});

export type UploadDocumentMetadataInput = z.infer<typeof uploadDocumentMetadataSchema>;
