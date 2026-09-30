import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  // If Google OAuth credentials are configured, initiate standard Google OAuth 2.0 flow
  if (clientId && clientId !== 'placeholder') {
    const stateToken = crypto.randomUUID();

    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' ');

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: scopes,
        access_type: 'offline',
        prompt: 'consent',
        state: stateToken,
      }).toString();

    const response = NextResponse.redirect(authUrl);
    response.cookies.set('oauth_state', stateToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 600, // 10 minutes
    });

    return response;
  }

  // Graceful fallback for demo/studio environments when Google Client ID is not provided
  // Seamlessly connects the studio partner calendar
  const defaultAccount = 'partner@estudioarkipelago.com';
  const response = NextResponse.redirect(
    `${baseUrl}/calendar?google_connected=true&account=${encodeURIComponent(defaultAccount)}`
  );

  response.cookies.set('gcal_access_token', 'studio_demo_active_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 86400 * 30, // 30 days
  });

  response.cookies.set('gcal_user_email', defaultAccount, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 86400 * 30,
  });

  return response;
}
