import { kafkaAdmin } from '@/lib/kafka/kafkaAdmin';

export async function GET() {
  try {
    const kAdmin = new kafkaAdmin();
    const data = await kAdmin.getTopicMetadata();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching topic metadata:', error);
    return Response.json({ error: 'Failed to fetch topic metadata' }, { status: 500 });
  }
}
