import { KafkaAdmin } from '@/lib/kafka/kafkaAdmin';
import { NextRequest } from 'next/server';

export async function GET() {
  try {
    const kAdmin = new KafkaAdmin();
    const data = await kAdmin.getTopicMetadata();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching topic metadata:', error);
    return Response.json({ error: 'Failed to fetch topic metadata' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {topic}: {topic: string} = await req.json();
    const kAdmin = new KafkaAdmin();
    const data = await kAdmin.getTopicMetadata({topics: [topic]});
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching topic metadata:', error);
    return Response.json({ error: 'Failed to fetch topic metadata' }, { status: 500 });
  }
}
