import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';
import { getDatabase, Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBqbfE0o15xrjCaUQRq2VSbf3mpATN7YMI',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'zipadvo2026new.firebaseapp.com',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://zipadvo2026new-default-rtdb.firebaseio.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'zipadvo2026new',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'zipadvo2026new.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '914723210294',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:914723210294:web:bce12c6792d8c654188497',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-536LMB3MY4',
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let rtdb: Database;
let emulatorsConnected = false;

function initFirebaseClient() {
  if (getApps().length > 0) {
    app = getApp();
  } else {
    app = initializeApp(firebaseConfig);
  }

  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  try {
    rtdb = getDatabase(app);
  } catch {
    // Graceful initialization if offline
  }

  // Safely initialize analytics in browser only
  if (typeof window !== 'undefined') {
    import('firebase/analytics')
      .then(({ getAnalytics, isSupported }) => {
        isSupported().then((supported) => {
          if (supported) {
            try {
              getAnalytics(app);
            } catch {
              // Analytics supported in browser
            }
          }
        });
      })
      .catch(() => {});
  }

  // Connect to Firebase Emulator Suite in local development if enabled
  if (
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true' &&
    typeof window !== 'undefined' &&
    !emulatorsConnected
  ) {
    try {
      const authHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || 'http://127.0.0.1:9099';
      const firestoreHost = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST || '127.0.0.1';
      const storageHost = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST || '127.0.0.1';

      connectAuthEmulator(auth, authHost, { disableWarnings: true });
      connectFirestoreEmulator(db, firestoreHost, 8080);
      connectStorageEmulator(storage, storageHost, 9199);
      emulatorsConnected = true;
    } catch {
      // Emulator connection handled safely
    }
  }
}

initFirebaseClient();

export { app, auth, db, storage, rtdb };
