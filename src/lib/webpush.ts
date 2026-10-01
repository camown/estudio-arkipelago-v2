import webpush from 'web-push';

export const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BL1posQp33uIfOkRwwquQYaxNqlZjLQBtmYHrQbziFvMWg1FizAdUhj4CYfsLPOmJGNqc6wbps6KoYnOh9A_BcQ';

export const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  '4MCQ5X-lSPVogvr-zTrzyIrfedatSxLMXjSR-tTf4Sw';

export const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || 'mailto:admin@arkipelago.ph';

// Configure WebPush with VAPID credentials
try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (err) {
  console.warn('WebPush VAPID initialization warning:', err);
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  image?: string;
}

export interface PushSubscriptionItem {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Send encrypted Web Push payload to a single subscription endpoint
 */
export async function sendPushNotification(
  subscription: PushSubscriptionItem,
  payload: PushNotificationPayload
) {
  try {
    const pushPayload = JSON.stringify({
      title: payload.title || 'ESTUDIO ARKIPELAGO',
      body: payload.body || 'New studio activity.',
      url: payload.url || '/dashboard',
      tag: payload.tag || 'arkipelago-alert',
      image: payload.image,
    });

    const result = await webpush.sendNotification(subscription, pushPayload, {
      TTL: 60 * 60 * 24, // 24 hours
      urgency: 'high',
    });

    return { success: true, statusCode: result.statusCode };
  } catch (error: unknown) {
    const errObj = error as { statusCode?: number; message?: string };
    console.error('WebPush Delivery Failure:', errObj.message || errObj);
    return { success: false, statusCode: errObj.statusCode, error: errObj.message };
  }
}
