# LegalHubMumbai

> Production-grade legal-technology marketplace connecting property buyers and document-registration clients with verified lawyers in Mumbai.

---

## 🏛️ Project Structure

This monorepo uses standard **npm workspaces**:

```
legalhubmumbai/
├── apps/
│   └── web/            # Next.js 14 App Router web platform
├── functions/          # Firebase Cloud Functions (trusted server logic)
├── packages/
│   ├── types/          # Domain entity definitions & interfaces
│   ├── validation/     # Zod runtime validation schemas
│   ├── config/         # Environment & constant configurations
│   ├── utils/          # PII-safe logging, AppError hierarchy, formatters
│   └── ui/             # Shared UI components & design system tokens
├── tests/
│   ├── unit/           # Vitest unit test suite
│   ├── integration/    # Integration tests
│   └── e2e/            # Playwright end-to-end tests
└── docs/               # Comprehensive architecture & engineering docs
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher
- **Git**

### 2. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env.local
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 🛠️ Verification & Quality Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server |
| `npm run lint` | Runs ESLint checks across all packages and apps |
| `npm run typecheck` | Runs strict TypeScript checks across all workspaces |
| `npm run test` | Executes unit tests with Vitest |
| `npm run test:watch` | Runs unit tests in watch mode |
| `npm run test:coverage` | Runs unit tests with test coverage reporting |
| `npm run test:e2e` | Runs Playwright end-to-end tests |
| `npm run build` | Builds all packages and compiles Next.js for production |

---

## 🔒 Security & Privacy

- **PII Scrubbing**: Automatic redaction of Aadhaar, PAN, card numbers, OTPs, and auth tokens.
- **Server Separation**: Strict boundary preventing sensitive database mutations directly from the browser.
- **Strict Typing**: Zero untyped `any` in core domain logic.

---

## 📚 Documentation

For in-depth architecture details, consult the [docs/](./docs/README.md) directory:
- [Architecture & Monorepo Design](./docs/architecture/README.md)
- [Database & Storage Schema](./docs/database/README.md)
- [Security, Auth & Compliance](./docs/security/README.md)
- [API Design & Service Boundaries](./docs/api/README.md)
- [Deployment & CI/CD Strategy](./docs/deployment/README.md)
