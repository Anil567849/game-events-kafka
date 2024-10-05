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
