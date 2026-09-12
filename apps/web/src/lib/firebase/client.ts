import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyPlaceholderClientApiKey123456789',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'legalhubmumbai-dev.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'legalhubmumbai-dev',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'legalhubmumbai-dev.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '100000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:100000000000:web:abcdef1234567890',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
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

export { app, auth, db, storage };
