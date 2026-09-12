import * as admin from 'firebase-admin';

/**
 * Server-Side Firebase Admin Initialization
 * Strictly safe for Next.js Server Components, Server Actions, and Route Handlers.
 */
function getFirebaseAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0] as admin.app.App;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
    ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (projectId && clientEmail && privateKey) {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.STORAGE_PRIVATE_BUCKET,
    });
  }

  // Fallback to default application credentials if running in GCP environment
  return admin.initializeApp();
}

export function getAdminAuth(): admin.auth.Auth {
  return getFirebaseAdminApp().auth();
}

export function getAdminFirestore(): admin.firestore.Firestore {
  return getFirebaseAdminApp().firestore();
}

export function getAdminStorage(): admin.storage.Storage {
  return getFirebaseAdminApp().storage();
}
