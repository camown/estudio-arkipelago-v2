import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface GoogleCalendarEventItem {
  id: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  location?: string;
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('gcal_access_token')?.value;
  const userEmail = cookieStore.get('gcal_user_email')?.value || 'Gmail User';

  // If live Google OAuth token exists, fetch REAL live events from Google Calendar API!
  if (token) {
    try {
      const now = new Date();
      // Start of current month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const gcalUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        new URLSearchParams({
          timeMin: startOfMonth,
          timeMax: endOfMonth,
          singleEvents: 'true',
          orderBy: 'startTime',
          maxResults: '50',
        }).toString();

      const res = await fetch(gcalUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const realEvents = (data.items || []).map((item: GoogleCalendarEventItem) => {
          const startDate = new Date(item.start?.dateTime || item.start?.date || Date.now());
          return {
            id: item.id,
            summary: item.summary || '(No Title)',
            description: item.description || '',
            start: item.start?.dateTime || item.start?.date,
            end: item.end?.dateTime || item.end?.date,
            day: startDate.getDate(),
            location: item.location || '',
            source: 'Google Calendar (Live)',
          };
        });

        return NextResponse.json({
          success: true,
          isLive: true,
          syncedAt: new Date().toISOString(),
          account: userEmail,
          events: realEvents,
        });
      }
    } catch (err) {
      console.error('Error fetching Google Calendar live API:', err);
    }
  }

  // Fallback / Default demo events if not logged in via Google OAuth
  const mockEvents = [
    {
      id: 'gcal-001',
      summary: '[CV-2024] Client Concept Review',
      description: 'Presentation of Schematic Design options to Verde Family Estate',
      start: '2026-09-08T10:00:00Z',
      end: '2026-09-08T11:30:00Z',
      day: 8,
      location: 'Estudio Main Conference Room / Zoom',
      source: 'Google Calendar (Synced)',
    },
    {
      id: 'gcal-002',
      summary: '[MT-2024] Structural Inspection',
      description: 'On-site inspection of 14th floor concrete pour with Engr. Ana Villanueva',
      start: '2026-09-15T14:00:00Z',
      end: '2026-09-15T16:00:00Z',
      day: 15,
      location: 'Makati Tower Site',
      source: 'Google Calendar (Synced)',
    },
    {
      id: 'gcal-003',
      summary: '[BCP-2024] Permit Submission Deadline',
      description: 'Final submission of blueprint sets to City Hall',
      start: '2026-09-22T09:00:00Z',
      end: '2026-09-22T17:00:00Z',
      day: 22,
      location: 'City Planning Office',
      source: 'Google Calendar (Synced)',
    },
  ];

  return NextResponse.json({
    success: true,
    isLive: false,
    syncedAt: new Date().toISOString(),
    account: 'partner@arkipelago.com (Demo)',
    events: mockEvents,
  });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('gcal_access_token')?.value;

  try {
    const body = await request.json();
    const { summary, startDate, endDate, description, location } = body;

    if (token) {
      // Create REAL live event on Google Calendar API
      const gcalRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary,
          description,
          location,
          start: { dateTime: startDate },
          end: { dateTime: endDate },
        }),
      });

      if (gcalRes.ok) {
        const liveEvent = await gcalRes.json();
        return NextResponse.json({
          success: true,
          isLive: true,
          message: 'Live Event created in Google Calendar!',
          event: liveEvent,
        });
      }
    }

    // Fallback simulation response
    const newGoogleEvent = {
      id: 'gcal-' + Date.now(),
      summary,
      description,
      start: startDate,
      end: endDate,
      status: 'confirmed',
      syncedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      isLive: false,
      message: 'Event synced to Google Calendar (Demo Mode)',
      event: newGoogleEvent,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to sync event' },
      { status: 400 }
    );
  }
}

