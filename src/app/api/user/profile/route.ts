import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

// In-memory server-side profile store fallback
const serverProfileStore = new Map<string, {
  id?: string;
  email: string;
  name: string;
  role?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  updatedAt: string;
}>();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email')?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json({
        success: true,
        profiles: Array.from(serverProfileStore.values()),
      });
    }

    // Try Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (!error && data) {
          return NextResponse.json({
            success: true,
            profile: {
              id: data.id,
              email: data.email,
              name: data.full_name,
              role: data.role,
              avatarUrl: data.avatar_url,
              updatedAt: data.updated_at,
            },
          });
        }
      } catch (err) {
        console.warn('Supabase query profiles warning:', err);
      }
    }

    const cached = serverProfileStore.get(email);
    return NextResponse.json({
      success: true,
      profile: cached || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to retrieve profile' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, role, phoneNumber, avatarUrl } = body;

    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: 'Email and Name are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const updatedProfile = {
      email: cleanEmail,
      name: name.trim(),
      role: role || 'junior_architect',
      phoneNumber: phoneNumber ? String(phoneNumber).trim() : undefined,
      avatarUrl: avatarUrl || undefined,
      updatedAt: new Date().toISOString(),
    };

    serverProfileStore.set(cleanEmail, updatedProfile);

    // If Supabase is configured, attempt to persist to profiles table
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert(
            {
              email: cleanEmail,
              full_name: updatedProfile.name,
              role: updatedProfile.role,
              avatar_url: updatedProfile.avatarUrl || null,
              updated_at: updatedProfile.updatedAt,
            },
            { onConflict: 'email' }
          );

        if (error) {
          console.warn('Supabase profiles upsert notice:', error.message);
        }
      } catch (dbErr) {
        console.warn('Supabase profiles exception notice:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
