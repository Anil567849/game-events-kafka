import { NextRequest } from "next/server";
import { CompressionTypes } from "kafkajs";
import { kafkaClient } from "../../../../lib/kafka";
const producer = kafkaClient.producer() // allowAutoTopicCreation: true;


export async function POST(request: NextRequest){

    const {topic, messages} = await request.json();

    try {
        await producer.connect()
        await producer.send({
            topic,
            messages,
            acks: 0,
            timeout: 30000,
            compression: CompressionTypes.None
        })
        return Response.json({data: "Produced"}, {status: 200});
    } catch (error) {
        return Response.json({data: "Not Produced"}, {status: 500});
    }

}