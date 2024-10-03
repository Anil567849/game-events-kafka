import { NextResponse } from 'next/server';
import { getLatestScores } from '@/lib/kafka/kafkaConsumer';

export async function GET() {
  try {
    const scores: { sport: string; score: string }[] = await getLatestScores();
    return NextResponse.json(scores);
  } catch (error) {
    console.error('Error fetching initial scores:', error);
    return NextResponse.json({ error: 'Failed to fetch initial scores' }, { status: 500 });
  }
}