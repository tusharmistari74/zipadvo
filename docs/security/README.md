# Security, Authentication & Data Protection

## 1. Authentication & Role-Based Access Control (RBAC)

Authentication is anchored by **Firebase Authentication** with Custom Claims mapped directly to user roles:
- `client`: Read verified lawyers, initiate bookings, upload consultation documents, pay ₹299 fee, view own history.
- `lawyer`: Manage personal profile, upload Bar Council Sanad for KYC, view assigned booking dossiers, manage appointments.
- `admin`: Review & approve lawyer KYC, manage platform disputes, audit Razorpay payments, configure fee settings.

### Custom Claims Token Structure
```json
{
  "role": "lawyer",
  "permissions": ["lawyer:write_profile", "lawyer:submit_kyc", "booking:manage_assigned"],
  "kycStatus": "verified"
}
```

## 2. Security Rules Guardrails

1. **Zero Open Access**: No collection or storage path allows `allow read, write: if true;`.
2. **Untrusted Write Prevention**: Critical collections (`payments`, `audit_logs`) have client-side writes completely disabled (`allow write: if false;`).
3. **Immutability of Bookings & Disputes**: Hard deletion of bookings and disputes is disabled (`allow delete: if false;`).
4. **Storage File Type & Size Validation**: Uploaded documents are strictly checked for MIME types (`application/pdf`, `image/jpeg`, `image/png`) and file size limits (5MB for avatars, 25MB for legal documents).

## 3. PII Masking & Indian DPDP Act Compliance

- **Aadhaar Protection**: Raw 12-digit Aadhaar numbers are never stored in plain text. Only the last 4 digits (`aadhaarLastFour`) are saved alongside encrypted document proofs in private storage.
- **Automated Logger Sanitization**: The `@legalhub/utils` logger scrubs Aadhaar, PAN, card numbers, OTPs, passwords, and Bearer tokens before writing to log streams.
- **Signed URL Access**: Private documents are accessed via time-limited signed URLs (default 15 minutes) generated server-side following permission verification.
