import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "operational",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
    environment: process.env.NODE_ENV,
    services: {
      database: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? "connected"
        : "localStorage-only",
      calendar: "not-configured",
      storage: "not-configured",
    },
  });
}
