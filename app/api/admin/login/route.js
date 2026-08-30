import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { hostId, hostPassword } = await req.json();

    const validHostId = process.env.HOST_ID;
    const validHostPassword = process.env.HOST_PASSWORD;

    if (!validHostId || !validHostPassword) {
      return NextResponse.json(
        { error: 'Server authentication environment variables not configured' },
        { status: 500 }
      );
    }

    if (hostId !== validHostId || hostPassword !== validHostPassword) {
      return NextResponse.json({ error: 'Invalid Host ID or Password' }, { status: 401 });
    }

    return NextResponse.json({ success: true, message: 'Authenticated successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Authentication error' }, { status: 500 });
  }
}
