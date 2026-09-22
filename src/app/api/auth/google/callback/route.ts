import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const storedState = request.cookies.get('oauth_state')?.value;

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/calendar?error=oauth_denied`);
  }

  // Validate state token for CSRF protection
  if (!state || !storedState || state !== storedState) {
    console.error('OAuth state mismatch: potential CSRF attack');
    return NextResponse.redirect(`${baseUrl}/calendar?error=csrf_detected`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('Failed to obtain Google access token:', tokenData);
      return NextResponse.redirect(`${baseUrl}/calendar?error=token_failed`);
    }

    let userEmail = 'Gmail User';
    try {
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const userData = await userRes.json();
      if (userData.email) userEmail = userData.email;
    } catch (e) {
      console.error('Failed to fetch user email:', e);
    }

    const response = NextResponse.redirect(
      `${baseUrl}/calendar?synced=true&account=${encodeURIComponent(userEmail)}`
    );

    const isProd = process.env.NODE_ENV === 'production';

    response.cookies.set('gcal_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: tokenData.expires_in || 3600,
    });

    response.cookies.set('gcal_user_email', userEmail, {
      path: '/',
      secure: isProd,
      sameSite: 'lax',
      maxAge: tokenData.expires_in || 3600,
    });

    // Clear state cookie
    response.cookies.delete('oauth_state');

    return response;
  } catch (err) {
    console.error('OAuth Callback Error:', err);
    return NextResponse.redirect(`${baseUrl}/calendar?error=server_error`);
  }
}

