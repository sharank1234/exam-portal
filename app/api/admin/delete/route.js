import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { hostId, hostPassword, paperId } = await req.json();

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

    if (!paperId) {
      return NextResponse.json({ error: 'Missing paper ID' }, { status: 400 });
    }

    // Remove the exam data and its ID from the active list
    await kv.del(paperId);
    await kv.lrem('all_exam_ids', 0, paperId);

    return NextResponse.json({ success: true, message: 'Question paper deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to delete paper' }, { status: 500 });
  }
}
