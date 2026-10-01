'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

const VAPID_PUBLIC_KEY = 'BL1posQp33uIfOkRwwquQYaxNqlZjLQBtmYHrQbziFvMWg1FizAdUhj4CYfsLPOmJGNqc6wbps6KoYnOh9A_BcQ';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check browser/PWA support & existing subscription
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);

      // Register background Service Worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          return registration.pushManager.getSubscription();
        })
        .then((existingSub) => {
          setIsSubscribed(Boolean(existingSub));
        })
        .catch((err) => {
          console.warn('Service Worker registration notice:', err);
        });
    }
  }, []);

  const subscribeToPush = useCallback(async () => {
    if (!isSupported) {
      alert('Push notifications are not supported by this browser.');
      return false;
    }

    setIsLoading(true);

    try {
      // 1. Request OS/Browser permission
      const userPerm = await Notification.requestPermission();
      setPermission(userPerm);

      if (userPerm !== 'granted') {
        setIsLoading(false);
        return false;
      }

      // 2. Wait for Service Worker to be ready
      const registration = await navigator.serviceWorker.ready;

      // 3. Subscribe with VAPID Public Key
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // 4. Send subscription payload to Next.js API
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          userEmail: user?.email || 'architect@arkipelago.ph',
          userId: user?.id || null,
        }),
      });

      setIsSubscribed(true);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      setIsLoading(false);
      return false;
    }
  }, [isSupported, user]);

  const sendTestPush = useCallback(async () => {
    try {
      await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'ESTUDIO ARKIPELAGO 🔔',
          message: 'Messenger-style push notifications are now active on this device!',
          url: '/chat',
          targetEmail: user?.email || undefined,
        }),
      });
    } catch (e) {
      console.error('Test push error:', e);
    }
  }, [user]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribeToPush,
    sendTestPush,
  };
}
