import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/client';
import { COLLECTIONS } from '../firebase/collections';
import type { PlatformSettings } from '@legalhub/types';
import { getPlatformSettings, DEFAULT_PLATFORM_SETTINGS } from '../services/settings.service';

export function usePlatformSettings() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    // 1. Sync from localStorage on client mount if available
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('zipadvo_platform_settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          setSettings((prev) => ({
            ...prev,
            ...parsed,
            fees: {
              ...prev.fees,
              ...(parsed.fees || {}),
            },
          }));
        }
      }
    } catch {
      // Fallback to default
    }

    // 2. Fetch fresh settings from Public API
    setLoading(true);
    fetch('/api/platform-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings((prev) => ({
            ...prev,
            ...data.settings,
            fees: {
              ...prev.fees,
              ...(data.settings.fees || {}),
            },
          }));
          if (typeof window !== 'undefined') {
            localStorage.setItem('zipadvo_platform_settings', JSON.stringify(data.settings));
          }
        }
        setLoading(false);
      })
      .catch(() => {
        getPlatformSettings()
          .then((s) => {
            setSettings(s);
            setLoading(false);
          })
          .catch(() => {
            setLoading(false);
          });
      });

    // 3. Real-Time Firestore Live Listener
    let unsubscribeFirestore = () => {};
    try {
      const docRef = doc(db, COLLECTIONS.PLATFORM_SETTINGS, 'global_settings');
      unsubscribeFirestore = onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
          const liveData = snap.data() as Partial<PlatformSettings>;
          setSettings((prev) => ({
            ...prev,
            ...liveData,
            fees: {
              ...prev.fees,
              ...(liveData.fees || {}),
            },
          }));
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('zipadvo_platform_settings', JSON.stringify({ ...DEFAULT_PLATFORM_SETTINGS, ...liveData }));
            } catch {
              // Ignore
            }
          }
        }
      }, () => {
        // Silently handle offline/listener fallback
      });
    } catch {
      // Ignore
    }

    // 4. Custom and Storage Events
    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<PlatformSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      } else {
        getPlatformSettings().then(setSettings).catch(() => {});
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'zipadvo_platform_settings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setSettings((prev) => ({ ...prev, ...parsed }));
        } catch {
          // Ignore
        }
      }
    };

    window.addEventListener('zipadvo_settings_updated', handleUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      unsubscribeFirestore();
      window.removeEventListener('zipadvo_settings_updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const unlockFee = settings.unlockFee ?? settings.fees?.consultationUnlockFeeInr ?? 299;
  const commissionRate = settings.commissionRate ?? settings.fees?.platformCommissionPercentage ?? 10;
  const supportEmail = settings.supportEmail || 'zipadvo@gmail.com';
  const supportPhone = settings.supportPhone || '+91 77689 42390';
  const platformVersion = settings.platformVersion || '1.0.0';

  return {
    settings,
    loading,
    mounted,
    isMounted: mounted,
    unlockFee,
    commissionRate,
    supportEmail,
    supportPhone,
    platformVersion,
  };
}
