import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(req) {
  try {
    const { hostId, hostPassword, title, subject, questions, unlockDateTime } = await req.json();

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

    if (!title || !subject || !questions || !unlockDateTime) {
      return NextResponse.json({ error: 'Missing required exam fields' }, { status: 400 });
    }

    const paperId = `exam_${Date.now()}`;
    const newPaper = {
      id: paperId,
      title: title.trim(),
      subject: subject.trim(),
      questions: questions.trim(),
      unlockTime: new Date(unlockDateTime).toISOString(),
      createdAt: new Date().toISOString(),
    };

    await kv.set(paperId, newPaper);
    await kv.lpush('all_exam_ids', paperId);

    return NextResponse.json({ success: true, message: 'Question paper locked and scheduled.' });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to upload paper' }, { status: 500 });
  }
}

