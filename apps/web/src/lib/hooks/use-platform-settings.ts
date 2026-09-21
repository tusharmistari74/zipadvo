'use client';

import { useState, useEffect } from 'react';
import type { PlatformSettings } from '@legalhub/types';
import { getPlatformSettings, DEFAULT_PLATFORM_SETTINGS } from '../services/settings.service';

export function usePlatformSettings() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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

    // 2. Fetch fresh settings from Firestore / API
    getPlatformSettings()
      .then((s) => {
        setSettings(s);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<PlatformSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      } else {
        getPlatformSettings().then(setSettings);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'zipadvo_platform_settings') {
        getPlatformSettings().then(setSettings);
      }
    };

    window.addEventListener('zipadvo_settings_updated', handleUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
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
    unlockFee,
    commissionRate,
    supportEmail,
    supportPhone,
    platformVersion,
  };
}
