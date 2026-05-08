import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported) {
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const subscribe = async () => {
    if (!isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    setIsPending(true);
    try {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) {
        console.warn('User not authenticated');
        setIsPending(false);
        return false;
      }

      const user = await base44.auth.me();
      const registration = await navigator.serviceWorker.ready;

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setIsPending(false);
        return false;
      }

      // Get VAPID key from window (set via index.html or build process)
      const vapidKey = window.VAPID_PUBLIC_KEY || import.meta.env.VITE_VAPID_PUBLIC_KEY || '';
      
      if (!vapidKey) {
        console.warn('VAPID_PUBLIC_KEY not configured');
        setIsPending(false);
        return false;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });

      // Save subscription to database
      const subObject = subscription.toJSON();
      await base44.entities.PushSubscription.create({
        user_email: user.email,
        endpoint: subscription.endpoint,
        auth: subObject.keys.auth,
        p256dh: subObject.keys.p256dh,
        device_name: `${navigator.userAgentData?.platform || 'Unknown'} - ${new Date().toLocaleString()}`
      });

      setIsSubscribed(true);
      setIsPending(false);
      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      setIsPending(false);
      return false;
    }
  };

  const unsubscribe = async () => {
    setIsPending(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Mark subscription as inactive in database
        const user = await base44.auth.me();
        const subs = await base44.entities.PushSubscription.filter({
          user_email: user.email,
          endpoint: subscription.endpoint
        });

        if (subs.length > 0) {
          await base44.entities.PushSubscription.update(subs[0].id, { active: false });
        }

        // Unsubscribe from push service
        await subscription.unsubscribe();
        setIsSubscribed(false);
      }

      setIsPending(false);
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      setIsPending(false);
      return false;
    }
  };

  return {
    isSupported,
    isSubscribed,
    isPending,
    subscribe,
    unsubscribe
  };
}

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}