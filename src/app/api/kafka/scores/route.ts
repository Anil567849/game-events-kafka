import { NextRequest } from 'next/server';
import { initKafkaConsumers } from '../../../../lib/kafka/kafkaConsumer';

// export const dynamic = 'force-dynamic';
// export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = (sport: string, score: string) => {
        // The controller is like the postal service, and enqueue is like telling the postal service, "Please send this letter next!"
        // The encoder turns your human-readable message into a series of numbers that computers can send quickly.
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ sport, score })}\n\n`));
      };

      await initKafkaConsumers(
        (score: any) => sendUpdate('soccer', score),
        (score: any) => sendUpdate('basketball', score)
      );

      // Keep the connection alive
      const interval = setInterval(() => {
        controller.enqueue(encoder.encode(':keepalive\n\n'));
      }, 30000);

      // Clean up on close
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}