import { Consumer } from "kafkajs";
import { kafkaClient } from ".";
import { KafkaAdmin } from "./kafkaAdmin";

type UpdateCallback = (topic: string, score: string, partition: number) => void;

export async function kafkaConsumers(onUpdate: UpdateCallback) {

  const kAdmin = new KafkaAdmin();
  try {
    let topics = await kAdmin.getTopicList();
    topics = topics.filter((topic) => topic !== '__consumer_offsets')
    const consumerPromises = topics.map(async (topic) => {
        const groupId = `${topic}-group`;

        let consumers: Consumer[] = [];
        for (let i = 0; i < 5; i++) {
          const consumer = kafkaClient.consumer({ groupId });

          await consumer.connect();
          await consumer.subscribe({ topic, fromBeginning: true });

          await consumer.run({
            eachMessage: async ({ topic, message, partition }) => {
                const score = message.value?.toString() || '';
                const key = message.key?.toString() || '';
                console.log(`Got a message from topic ${topic}, key ${key}, and partition ${partition}:`, score);
                onUpdate(topic, score, partition);
            },
          });

          consumers.push(consumer); // Return the consumer for potential cleanup later
        }
        return consumers;
    });

    const consumers = await Promise.all(consumerPromises);

    // Return a cleanup function
    return async () => {
      const allConsumers = consumers.flat();
      await Promise.all(allConsumers.map(consumer => consumer.disconnect()));
    };
  } catch (error) {
    console.error('Error setting up Kafka consumers:', error);
    throw error;
  }
} 
