import { Consumer } from "kafkajs";
import { kafkaClient } from ".";
import { KafkaAdmin } from "./kafkaAdmin";

type UpdateCallback = (topic: string, score: string) => void;

export async function kafkaConsumers(onUpdate: UpdateCallback) {

  const kAdmin = new KafkaAdmin();
  try {
    let topics = await kAdmin.getTopicList();
    topics = topics.filter((topic) => topic !== '__consumer_offsets')
    const consumerPromises = topics.map(async (topic) => {
        const groupId = `${topic}-group`;
        const consumer = kafkaClient.consumer({ groupId });
        const consumer1 = kafkaClient.consumer({ groupId });

        await consumer.connect();
        await consumer1.connect();
        await consumer.subscribe({ topic, fromBeginning: true });
        await consumer1.subscribe({ topic, fromBeginning: true });

        await consumer.run({
          eachMessage: async ({ topic, message, partition }) => {
            if(partition == 0){
              const score = message.value?.toString() || '';
              console.log(`Got a message from topic ${topic} and partition ${partition}:`, score);
              onUpdate(topic, score);
            }
          },
        });

        await consumer1.run({
          eachMessage: async ({ topic, message, partition }) => {
            if(partition === 1){
              const score = message.value?.toString() || '';
              console.log(`Got a message from topic ${topic} and partition ${partition}:`, score);
              onUpdate(topic, score);
            }
          },
        });

        return consumer; // Return the consumer for potential cleanup later
    });

    const consumers = await Promise.all(consumerPromises);

    // Return a cleanup function
    return async () => {
      await Promise.all(consumers.map(consumer => consumer.disconnect()));
    };
  } catch (error) {
    console.error('Error setting up Kafka consumers:', error);
    throw error;
  }
} 
