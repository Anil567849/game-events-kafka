import { KafkaAdmin } from '@/lib/kafka/kafkaAdmin';

export async function GET() {
  try {
    const kAdmin = new KafkaAdmin();
    const data = await kAdmin.getTopicList();
    return Response.json({data}, {status: 200});
  } catch (error) {
    console.error('Error fetching topic lists:', error);
    return Response.json({ error: 'Failed to fetch topic lists' }, { status: 500 });
  }
}