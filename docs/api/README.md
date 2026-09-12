# API Design & Service Boundaries

## 1. Unified Response Contract

All API Route Handlers and Server Actions conform to standard TypeScript response schema:

```typescript
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}
```

## 2. Error Code Registry

| Error Code | HTTP Status | Description |
| :--- | :--- | :--- |
| `BAD_REQUEST` | 400 | Malformed request syntax |
| `VALIDATION_ERROR` | 400 | Zod schema validation failure |
| `UNAUTHENTICATED` | 401 | Missing or invalid auth session |
| `FORBIDDEN` | 403 | Insufficient role or permission |
| `NOT_FOUND` | 404 | Target entity not found |
| `CONFLICT` | 409 | Duplicate entity or state conflict |
| `RATE_LIMITED` | 429 | Rate limit threshold exceeded |
| `INTERNAL_SERVER_ERROR`| 500 | Unhandled server exception (internals masked) |

## 3. Core Planned API Routes

- `POST /api/v1/auth/session` - Create verified session cookie
- `POST /api/v1/lawyers/kyc` - Submit Sanad and identity documents for review
- `POST /api/v1/bookings` - Create booking request
- `POST /api/v1/payments/create-order` - Generate Razorpay ₹299 order
- `POST /api/v1/payments/verify` - Verify Razorpay signature and unlock booking
- `POST /api/v1/documents/signed-url` - Generate short-lived signed access URL
- `POST /api/v1/admin/lawyers/:id/verify` - Approve/Reject lawyer KYC
