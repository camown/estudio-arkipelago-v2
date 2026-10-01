import { NextRequest, NextResponse } from 'next/server';
import { sendPushNotification } from '@/lib/webpush';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, message, url, tag, targetEmail } = body;

    let targetSubs: Array<{ endpoint: string; p256dh: string; auth: string }> = [];

    // Query active subscriptions from Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('push_subscriptions').select('endpoint, p256dh, auth');
        if (targetEmail) {
          query = query.eq('user_email', targetEmail);
        }
        const { data, error } = await query;
        if (!error && data) {
          targetSubs = data;
        }
      } catch (err) {
        console.warn('Supabase query push_subscriptions notice:', err);
      }
    }

    if (targetSubs.length === 0) {
      return NextResponse.json({
        success: true,
        sentCount: 0,
        message: 'No active device subscriptions found for recipient',
      });
    }

    let successCount = 0;
    for (const sub of targetSubs) {
      const result = await sendPushNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        {
          title: title || 'ESTUDIO ARKIPELAGO',
          body: message || 'New studio notification received.',
          url: url || '/dashboard',
          tag: tag || 'studio-alert',
        }
      );
      if (result.success) successCount++;
    }

    return NextResponse.json({
      success: true,
      sentCount: successCount,
      totalTargets: targetSubs.length,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Push delivery failure';
    return NextResponse.json(
      { success: false, error: errMessage },
      { status: 500 }
    );
  }
}
