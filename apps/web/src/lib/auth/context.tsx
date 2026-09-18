'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/client';
import { COLLECTIONS } from '../firebase/collections';
import type { UserProfile, UserRole } from '@legalhub/types';
import { signOutUser, getLocalAuthSession, saveLocalAuthSession } from './auth-service';

export interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  role: UserRole;
  isLoading: boolean;
  isAuthenticated: boolean;
  isClient: boolean;
  isLawyer: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async (firebaseUser: FirebaseUser) => {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        setProfile(data);
        saveLocalAuthSession(data);
      } else {
        const local = getLocalAuthSession();
        if (local) {
          setProfile(local);
        } else {
          setProfile(null);
        }
      }
    } catch {
      const local = getLocalAuthSession();
      if (local) {
        setProfile(local);
      } else {
        setProfile(null);
      }
    }
  };

  useEffect(() => {
    // Sync with local session immediately
    const initialLocal = getLocalAuthSession();
    if (initialLocal) {
      setProfile(initialLocal);
      setIsLoading(false);
    }

    // Listen for custom auth session updates across the window/tabs
    const handleSessionUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<UserProfile | null>;
      setProfile(customEvent.detail ?? getLocalAuthSession());
      setIsLoading(false);
    };

    window.addEventListener('auth-session-update', handleSessionUpdate);
    window.addEventListener('storage', handleSessionUpdate);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        const local = getLocalAuthSession();
        if (local) {
          setProfile(local);
        } else {
          setProfile(null);
        }
      }
      setIsLoading(false);
    });

    return () => {
      window.removeEventListener('auth-session-update', handleSessionUpdate);
      window.removeEventListener('storage', handleSessionUpdate);
      unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    } else {
      setProfile(getLocalAuthSession());
    }
  };

  const role: UserRole = profile?.role || 'client';
  const isAuthenticated = Boolean(user || profile);
  const isClient = role === 'client';
  const isLawyer = role === 'lawyer';
  const isAdmin = role === 'admin' || role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isLoading,
        isAuthenticated,
        isClient,
        isLawyer,
        isAdmin,
        signOut: signOutUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
