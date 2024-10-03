import { Consumer } from "kafkajs";
import { kafkaClient } from ".";

type UpdateCallback = (score: string) => void;

export async function initKafkaConsumers(onSoccerUpdate: UpdateCallback, onBasketballUpdate: UpdateCallback) {
  const soccer = kafkaClient.consumer({ groupId: 'soccer' });
  const basketball = kafkaClient.consumer({ groupId: 'basketball' });

  await soccer.connect();
  await basketball.connect();
  await soccer.subscribe({ topic: 'soccer', fromBeginning: true });
  await basketball.subscribe({ topic: 'basketball', fromBeginning: true });

  await soccer.run({
    eachMessage: async ({ message }) => {
      const score = message.value?.toString() || '';
      console.log('Soccer message:', score);
      onSoccerUpdate(score);
    },
  });

  await basketball.run({
    eachMessage: async ({ message }) => {
      const score = message.value?.toString() || '';
      console.log('Basketball message:', score);
      onBasketballUpdate(score);
    },
  });
}

interface ILOffset {
  partition: number;
  offset: string;
  high: string;
  low: string;
}

export async function getLatestScores(): Promise<{ sport: string; score: string }[]> {
    let admin = kafkaClient.admin();
    let consumerClient: Consumer | null = null;
    try {
      await admin.connect();

      const topics: string[] = ['soccer', 'basketball'];
      
      // Fetch the latest offsets for each topic
      const latestOffsets: ILOffset[][] = await Promise.all(
        topics.map(async (topic: string) => {
          return await admin.fetchTopicOffsets(topic) as ILOffset[];
        })
      );

      consumerClient = kafkaClient.consumer({ groupId: 'temp-group-' + Date.now() });
      await consumerClient.connect();

      const scores: { sport: string; score: string }[] = [];

      // Create a promise for each topic to consume its latest message
      await Promise.all(
        topics.map(async (topic, i) => {
          // Subscribe to the topic
          await consumerClient?.subscribe({ topic, fromBeginning: false });

          // Consume the latest message from the topic
          await consumerClient?.run({
            eachMessage: async ({ topic: t, message }) => {
              const score = message.value?.toString() || '0';
              console.log(`${t} message:`, score);
              // Store the score
              scores.push({ sport: t, score });
            },
          });
          
          // Seek to the latest offset
          const topicOffsets = parseInt(latestOffsets[i][0].offset)-1;
          await consumerClient?.seek({ topic, partition: 0, offset: topicOffsets.toString() })

          // Wait briefly to ensure the consumer runs for the latest message
          await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay to process messages
        })
      );
      return scores;
    } catch (error) {
        console.log('**********************error is: ', error);
        return [];
    } finally {
      if(consumerClient) await consumerClient?.disconnect();
      await admin.disconnect();
    }
  }