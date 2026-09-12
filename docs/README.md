# LegalHubMumbai Engineering & Architecture Documentation

Welcome to the central technical documentation repository for **LegalHubMumbai**, a production legal-technology marketplace connecting property buyers, conveyance clients, and document-registration users with verified lawyers in Mumbai.

## Documentation Index

- [Architecture Overview](./architecture/README.md) - System topology, monorepo workspaces, layering, and boundary rules.
- [Database & Storage Design](./database/README.md) - Firestore schema, collections, indexing rules, and Cloud Storage security.
- [Security, Auth & Compliance](./security/README.md) - Role-Based Access Control (RBAC), PII protection, Bar Council Sanad verification, and secret management.
- [API & Service Boundaries](./api/README.md) - REST/Server Action endpoints, Firebase Cloud Functions, and error contracts.
- [Deployment & CI/CD](./deployment/README.md) - Build pipelines, Firebase hosting, environments, and secrets rotation.

## Guiding Engineering Principles

1. **Production-First**: No throwaway prototypes or fake database implementations.
2. **Strict Separation of Concerns**: Direct client-side mutation of sensitive records is forbidden. All sensitive operations go through validated server-side logic / Cloud Functions.
3. **Strict Type Safety**: Strict TypeScript across all monorepo packages. No untyped `any`.
4. **Data Privacy & Compliance**: Automatic PII redaction for Aadhaar, PAN, and credentials.
