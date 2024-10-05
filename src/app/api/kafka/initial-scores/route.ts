import { NextResponse } from 'next/server';
import { kafkaAdmin } from '@/lib/kafka/kafkaAdmin';

export async function GET() {
  try {
    const kAdmin = new kafkaAdmin();
    const scores: { sport: string; score: string }[] = await kAdmin.getLatestScores();
    return NextResponse.json(scores);
  } catch (error) {
    console.error('Error fetching initial scores:', error);
    return NextResponse.json({ error: 'Failed to fetch initial scores' }, { status: 500 });
  }
}