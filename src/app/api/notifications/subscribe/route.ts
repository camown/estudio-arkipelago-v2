import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

// In-memory fallback registry for dev/local demo
const localSubscriptions = new Map<string, unknown>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscription, userEmail, userId } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { success: false, error: 'Invalid PushSubscription payload' },
        { status: 400 }
      );
    }

    const endpoint = subscription.endpoint;
    const p256dh = subscription.keys.p256dh;
    const auth = subscription.keys.auth;
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // 1. Save to memory fallback
    localSubscriptions.set(endpoint, {
      endpoint,
      p256dh,
      auth,
      userEmail,
      userId,
      userAgent,
      updatedAt: new Date().toISOString(),
    });

    // 2. Persist to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('push_subscriptions').upsert(
          {
            endpoint,
            p256dh,
            auth,
            user_email: userEmail || null,
            user_id: userId || null,
            user_agent: userAgent,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'endpoint' }
        );
      } catch (dbErr) {
        console.warn('Supabase push_subscriptions upsert notice:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Push subscription registered successfully',
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Subscription error';
    return NextResponse.json(
      { success: false, error: errMessage },
      { status: 500 }
    );
  }
}
