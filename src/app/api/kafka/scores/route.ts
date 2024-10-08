import { NextRequest } from 'next/server';
import { kafkaConsumers } from '../../../../lib/kafka/kafkaConsumer';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  let isStreamClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = (sport: string, score: string, partition: number) => {
        if (!isStreamClosed) {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ sport, score, partition })}\n\n`));
          } catch (error) {
            console.error('Error enqueueing data:', error);
            isStreamClosed = true;
          }
        }
      };

      const func = (topic: string, score: any, partition: number) => sendUpdate(topic, score, partition);

      try {
        await kafkaConsumers(func);
      } catch (error) {
        console.error('Error in kafkaConsumers:', error);
        isStreamClosed = true;
        controller.close();
        return;
      }

      const interval = setInterval(() => {
        if (!isStreamClosed) {
          try {
            controller.enqueue(encoder.encode(':keepalive\n\n'));
          } catch (error) {
            console.error('Error sending keepalive:', error);
            isStreamClosed = true;
            clearInterval(interval);
          }
        } else {
          clearInterval(interval);
        }
      }, 30000);

      req.signal.addEventListener('abort', () => {
        isStreamClosed = true;
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