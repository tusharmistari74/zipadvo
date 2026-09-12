# Deployment & CI/CD Strategy

## 1. Multi-Environment Architecture

| Environment | Firebase Project ID | Web App URL | Purpose |
| :--- | :--- | :--- | :--- |
| `development` | `legalhubmumbai-dev` (or Emulators) | `http://localhost:3000` | Local engineering & unit/integration testing |
| `staging` | `legalhubmumbai-staging` | `https://staging.legalhubmumbai.com` | Pre-production testing, QA & client reviews |
| `production` | `legalhubmumbai-prod` | `https://legalhubmumbai.com` | Live commercial legal marketplace |

## 2. Firebase Local Emulator Suite

To develop locally without incurring cloud costs or modifying remote data:
```bash
# Start Firebase Emulator Suite
firebase emulators:start
```

### Emulator Port Configuration:
- **Emulator UI**: `http://localhost:4000`
- **Auth Emulator**: `http://localhost:9099`
- **Firestore Emulator**: `http://localhost:8080`
- **Storage Emulator**: `http://localhost:9199`
- **Cloud Functions Emulator**: `http://localhost:5001`

To connect the Next.js frontend to the local emulator suite, set in `.env.local`:
```env
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
```

## 3. Environment Variable & Secret Boundary

- **Client Variables (`NEXT_PUBLIC_*`)**: Safe for browser bundles, validated at runtime with Zod schema in `@legalhub/config`.
- **Server Secrets (`FIREBASE_ADMIN_*`, `RAZORPAY_KEY_SECRET`)**: Stored in GitHub Secrets and injected into cloud runtime environments. Never exposed to the browser.
