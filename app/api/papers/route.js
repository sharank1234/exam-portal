import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const examIds = (await kv.lrange('all_exam_ids', 0, -1)) || [];
    if (examIds.length === 0) {
      return NextResponse.json([]);
    }

    const papers = await Promise.all(examIds.map((id) => kv.get(id)));
    const currentServerTime = Date.now();

    const sanitizedPapers = papers
      .filter(Boolean)
      .map((paper) => {
        const isUnlocked = currentServerTime >= new Date(paper.unlockTime).getTime();
        return {
          id: paper.id,
          title: paper.title,
          subject: paper.subject,
          unlockTime: paper.unlockTime,
          isUnlocked,
          // Content only exposed if timer is reached
          questions: isUnlocked ? paper.questions : null,
          fileData: isUnlocked ? paper.fileData : null,
          fileName: isUnlocked ? paper.fileName : null,
          fileType: isUnlocked ? paper.fileType : null,
        };
      });

    return NextResponse.json(sanitizedPapers);
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to retrieve exams' }, { status: 500 });
  }
}
