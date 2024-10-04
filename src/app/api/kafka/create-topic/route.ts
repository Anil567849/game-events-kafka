import { kafkaAdmin } from '@/lib/kafka/kafkaAdmin';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const {topic, partition}: {topic: string, partition: number} = await req.json();
        const kAdmin = new kafkaAdmin();
        const data = await kAdmin.createTopic(topic, partition);
        return Response.json(data);
    } catch (error) {
        console.error('Error creating topic:', error);
        return Response.json({ error: 'Failed to creating topic' }, { status: 500 });
    }
}