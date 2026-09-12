# System Architecture & Monorepo Design

## 1. System Overview

LegalHubMumbai is architected as a modular TypeScript monorepo powered by npm workspaces. It bridges three distinct user experiences:
1. **Client / Buyer Portal**: Discovery, booking, encrypted document upload, ₹299 unlock payment, consultation tracking.
2. **Lawyer Portal**: Bar Council KYC onboarding, consultation schedule, client document vault, payout tracking.
3. **Admin Panel**: Lawyer KYC verification, dispute mediation, payment audits, platform fee settings.

```
┌─────────────────────────────────────────────────────────────┐
│                     apps/web (Next.js)                      │
│  (Public Discovery | Client Portal | Lawyer App | Admin)    │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
      packages/ui & utils             packages/validation
               │                               │
               ▼                               ▼
    ┌───────────────────────┐       ┌──────────────────────┐
    │  Firebase Client SDK  │       │ Firebase Server / CF │
    │  (Public Auth/Read)   │       │ (Razorpay / Admin)   │
    └───────────────────────┘       └──────────────────────┘
```

## 2. Directory Structure

```
legalhubmumbai/
├── apps/
│   └── web/                # Next.js App Router application
├── functions/              # Firebase Cloud Functions (trusted server logic)
├── packages/
│   ├── types/              # Pure domain entities and interfaces
│   ├── validation/         # Zod schemas for all runtime input validation
│   ├── config/             # Runtime environment validation & constants
│   ├── utils/              # Error handling, PII logger, formatters
│   └── ui/                 # Reusable UI primitives & Tailwind theme
├── tests/
│   ├── unit/               # Vitest unit test suite
│   ├── integration/        # Service & flow integration tests
│   └── e2e/                # Playwright end-to-end smoke & user flow tests
├── docs/                   # Architectural & technical design documentation
├── firestore.rules         # Secure Firestore database rules
├── firestore.indexes.json  # Composite query indexing configuration
├── storage.rules           # Private & public storage access rules
├── firebase.json           # Firebase project & emulator configurations
├── .firebaserc             # Multi-project environment mapping
└── .github/                # CI/CD Workflows
```

## 3. Firebase Infrastructure Architecture

### Client vs Server SDK Boundary
- **Client Web SDK (`firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/storage`)**: Used exclusively inside browser contexts. Operates under the user's authenticated UID and evaluated strictly by `firestore.rules` and `storage.rules`.
- **Server Admin SDK (`firebase-admin`)**: Used strictly in Next.js Server Components, Server Actions, Route Handlers, and Cloud Functions. Bypasses client security rules to perform privileged operations (e.g. Razorpay webhook verification, KYC approval transitions, audit logging).

### Multi-Environment Strategy
- **Development**: `legalhubmumbai-dev` (or local Firebase Emulator Suite on ports 9099, 8080, 9199, 5001).
- **Staging**: `legalhubmumbai-staging` (isolated pre-production project).
- **Production**: `legalhubmumbai-prod` (live commercial project with strict automated backups and IAM isolation).
