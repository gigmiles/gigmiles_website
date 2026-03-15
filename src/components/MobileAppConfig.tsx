'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { isIOS, isAndroid, isNative } from '@/lib/platform';

export function MobileAppConfig() {
  const router = useRouter();

  useEffect(() => {
    if (!isNative) return;

    if (isIOS) {
      // Configure iOS status bar
      StatusBar.setStyle({ style: Style.Light }).catch(() => {});
      StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
    }

    if (isAndroid) {
      // Handle Android back button
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          router.back();
        } else {
          CapApp.exitApp();
        }
      });
    }

    return () => {
      if (isAndroid) {
        CapApp.removeAllListeners();
      }
    };
  }, [router]);

  return null;
}
