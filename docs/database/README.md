# Database & Storage Design (Cloud Firestore & Storage)

## 1. Cloud Firestore Collection Hierarchy

### `users` (Collection)
- **Document ID**: `uid` (Firebase Auth UID)
- **Fields**: `uid`, `email`, `phoneNumber`, `fullName`, `role` (`client` | `lawyer` | `admin`), `status`, `address`, `createdAt`, `updatedAt`
- **Security Rule**: Read/write by document owner or admin only. Non-admin users cannot elevate their role.

### `lawyers` (Collection)
- **Document ID**: `uid`
- **Fields**: `uid`, `fullName`, `title`, `bio`, `practiceAreas`, `primaryCourt`, `yearsOfExperience`, `spokenLanguages`, `officeAddress`, `barCouncil` (`sanadNumber`, `enrollmentYear`, `stateBarCouncil`), `kycStatus` (`unverified` | `submitted` | `verified` | `rejected`), `consultationFeeInr`, `rating`, `reviewCount`, `isAcceptingBookings`, `featured`
- **Security Rule**: Public read permitted only if `kycStatus == 'verified'`. Only Admins can modify `kycStatus` and `featured`.

### `lawyer_kyc` (Private Submissions Collection)
- **Document ID**: `uid`
- **Fields**: `panNumberEncrypted`, `panCardStoragePath`, `aadhaarLastFour`, `aadhaarProofStoragePath`, `sanadNumber`, `sanadCertificateStoragePath`, `submittedAt`, `verifiedAt`, `verifiedByAdminUid`, `rejectionReason`
- **Security Rule**: Strictly accessible by the lawyer owner and platform admins.

### `bookings` (Collection)
- **Document ID**: `bookingId`
- **Fields**: `bookingReferenceNumber`, `clientUid`, `clientName`, `clientPhone`, `lawyerUid`, `lawyerName`, `serviceCategory`, `caseDescription`, `preferredDate`, `preferredTimeSlot`, `consultationMode`, `status` (`draft` | `pending_unlock_payment` | `unlocked` | `accepted` | `in_progress` | `completed` | `cancelled_by_client` | `cancelled_by_lawyer` | `disputed`), `unlockAmountInr` (299), `unlockPaymentId`, `uploadedDocumentIds`, `timeline`
- **Security Rule**: Read/update restricted strictly to involved `clientUid`, `lawyerUid`, and `admin`.

### `payments` (Collection)
- **Document ID**: `paymentId`
- **Fields**: `bookingId`, `clientUid`, `lawyerUid`, `amountInr`, `currency`, `purpose`, `gateway` (`razorpay`), `status`, `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`, `failureReason`, `refunds`
- **Security Rule**: Read restricted to client/lawyer/admin. **Write access is denied to all client SDKs** (only writable via Server Admin SDK).

### `documents` (Collection)
- **Document ID**: `documentId`
- **Fields**: `ownerUid`, `bookingId`, `category`, `originalFileName`, `fileSizeBytes`, `mimeType`, `storagePath`, `accessLevel`, `auditTrail`, `isArchived`
- **Security Rule**: Owner and Admin access only.

### `reviews` (Collection)
- **Document ID**: `reviewId`
- **Fields**: `bookingId`, `lawyerUid`, `clientUid`, `clientDisplayName`, `rating`, `reviewTitle`, `reviewComment`, `status`
- **Security Rule**: Public read when `status == 'published'`. Create allowed only for authenticated clients.

### `disputes` (Collection)
- **Document ID**: `disputeId`
- **Fields**: `bookingId`, `raisedByUid`, `againstUid`, `reason`, `description`, `evidenceDocumentUrls`, `status`, `adminNotes`, `resolutionSummary`
- **Security Rule**: Involved parties and Admin read. Admin-only updates.

### `notifications` (Collection)
- **Document ID**: `notificationId`
- **Fields**: `recipientUid`, `type`, `title`, `body`, `channels`, `isRead`, `actionUrl`
- **Security Rule**: Recipient read and `isRead` toggle only.

### `platform_settings` (Collection)
- **Document ID**: `global_settings`
- **Fields**: `fees` (`consultationUnlockFeeInr: 299`, `gstPercentage: 18`), `maintenanceMode`, `allowedPincodes`, `supportEmail`, `supportPhone`
- **Security Rule**: Public read; Admin write.

### `audit_logs` (Collection)
- **Document ID**: `logId`
- **Fields**: `actorUid`, `actorRole`, `action`, `targetEntityId`, `targetEntityType`, `metadata`, `ipAddress`, `createdAt`
- **Security Rule**: Admin-only read; **client write denied**.

---

## 2. Firebase Cloud Storage Structure

```
gs://legalhubmumbai.appspot.com/
├── profiles/
│   └── {userId}/
│       └── avatar.jpg                 # Publicly viewable, owner-writable, max 5MB
├── lawyer-kyc/
│   └── {lawyerUid}/
│       ├── sanad_certificate.pdf      # Private: Lawyer & Admin only, max 25MB
│       ├── pan_card.pdf               # Private: Lawyer & Admin only
│       └── aadhaar_proof.pdf          # Private: Lawyer & Admin only
├── booking-documents/
│   └── {bookingId}/
│       └── {documentId}.pdf           # Private: Client, Lawyer & Admin only
└── completed-documents/
    └── {bookingId}/
        └── {documentId}_final.pdf     # Private: Lawyer & Admin write, Client read
```

---

## 3. Query Indexing Strategy

Configured in `firestore.indexes.json`:
- Composite index on `lawyers`: `(kycStatus ASC, featured DESC, rating DESC)` for directory discovery.
- Composite index on `lawyers`: `(kycStatus ASC, practiceAreas CONTAINS, rating DESC)` for category searches.
- Composite index on `bookings`: `(lawyerUid ASC, status ASC, createdAt DESC)` for lawyer dashboard queries.
- Composite index on `disputes`: `(status ASC, createdAt DESC)` for admin dispute queues.
