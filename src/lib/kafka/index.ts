import { Kafka } from 'kafkajs';

const broker = process.env.IP_ADDRESS as string + ':9092';

export const kafkaClient = new Kafka({
  clientId: 'kafka-app',
  brokers: [broker]
})