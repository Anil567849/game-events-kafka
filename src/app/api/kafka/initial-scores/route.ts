import { NextRequest, NextResponse } from 'next/server';
import { KafkaAdmin } from '@/lib/kafka/kafkaAdmin';

export async function GET() {
  try {
    const kAdmin = new KafkaAdmin();
    const scores: { sport: string; score: string }[] = await kAdmin.getLatestScores();
    return NextResponse.json(scores);
  } catch (error) {
    console.error('Error fetching initial scores:', error);
    return NextResponse.json({ error: 'Failed to fetch initial scores' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {topic} = await req.json();
    console.log(topic);
    
    const kAdmin = new KafkaAdmin();
    const score: { sport: string; score: string }[] = await kAdmin.getOneLatestScores(topic);
    return NextResponse.json(score);
    // return NextResponse.json(scores);
  } catch (error) {
    console.error('Error fetching initial scores:', error);
    return NextResponse.json({ error: 'Failed to fetch initial scores' }, { status: 500 });
  }
}