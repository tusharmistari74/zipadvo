/**
 * Shared Common Types across LegalHubMumbai
 */

export type ISO8601Timestamp = string;

export interface BaseEntity {
  id: string;
  createdAt: ISO8601Timestamp;
  updatedAt: ISO8601Timestamp;
}

export interface MumbaiAddress {
  line1: string;
  line2?: string;
  area: string; // e.g., 'Bandra West', 'Andheri East', 'Fort', 'Nariman Point', 'Borivali'
  city: 'Mumbai' | 'Navi Mumbai' | 'Thane';
  pincode: string; // 6-digit Indian PIN
  state: 'Maharashtra';
  country: 'India';
  landmark?: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  cursor?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: ISO8601Timestamp;
}
