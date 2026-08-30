import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { hostId, hostPassword, title, subject, unlockDateTime, questions, fileData, fileName, fileType } = await req.json();

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

    if (!title || !subject || !unlockDateTime || (!questions && !fileData)) {
      return NextResponse.json({ error: 'Please provide either question text or upload a file.' }, { status: 400 });
    }

    const paperId = `exam_${Date.now()}`;
    const newPaper = {
      id: paperId,
      title: title.trim(),
      subject: subject.trim(),
      questions: questions ? questions.trim() : null,
      fileData: fileData || null,
      fileName: fileName || null,
      fileType: fileType || null,
      unlockTime: new Date(unlockDateTime).toISOString(),
      createdAt: new Date().toISOString(),
    };

    await kv.set(paperId, newPaper);
    await kv.lpush('all_exam_ids', paperId);

    return NextResponse.json({ success: true, message: 'Question paper file locked and scheduled.' });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to upload paper' }, { status: 500 });
  }
}
