import { kafkaAdmin } from '@/lib/kafka/kafkaAdmin';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const {topic}: {topic: string[]} = await req.json();
        const kAdmin = new kafkaAdmin();
        const data = await kAdmin.deleteTopic(topic);
        return Response.json(data);
    } catch (error) {
        console.error('Error deleting topic:', error);
        return Response.json({ error: 'Failed to deleting topic' }, { status: 500 });
    }
}