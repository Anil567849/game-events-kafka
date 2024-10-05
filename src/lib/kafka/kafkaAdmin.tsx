import { Admin, Consumer, ITopicMetadata } from "kafkajs";
import { kafkaClient } from ".";
import { ILOffset } from "@/types/kafka";


export class kafkaAdmin {
    admin: Admin | null = null;

    constructor(){
        this.admin = kafkaClient.admin();
    }

    async getTopicList(): Promise<string[]> {
        try {
            await this.connect();
            const topics = await this.admin?.listTopics() as string[];
            return topics;
        } catch (error) {
            throw new Error("Error fetching topic list: " + error);
        } finally {
            await this.disconnect();
        }
    }

    async createTopic(topic: string, partition: number): Promise<boolean> {
        try {
            await this.connect();
            await this.admin?.createTopics({
                topics: [
                    {
                        topic,
                        numPartitions: partition,
                    }
                ],
            })
            return true;
        } catch (error) {
            throw new Error("Error creating topic: " + error);
        } finally {
            await this.disconnect();
        }
    }

    async deleteTopic(topic: string[]): Promise<boolean> {
        try {
            await this.connect();
            await this.admin?.deleteTopics({
                topics: topic,
                // timeout: <Number>, // default: 5000
            })
            return true;
        } catch (error) {
            throw new Error("Error creating topic: " + error);
        } finally {
            await this.disconnect();
        }
    }

    async getLatestScores(): Promise<{ sport: string; score: string }[]> {
        let consumerClient: Consumer | null = null;
        try {
            await this.connect();
    
            const topics: string[] = await this.getTopicList();
            
            // Fetch the latest offsets for each topic
            const latestOffsets: ILOffset[][] = await Promise.all(
                topics.map(async (topic: string) => {
                return await this.admin?.fetchTopicOffsets(topic) as ILOffset[];
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
            await this.disconnect();
        }
    }

    async getTopicMetadata(options?: { topics: string[] }): Promise<{ topics: Array<ITopicMetadata> }> {
        try {
            await this.connect();
            
            const metadata = await this.admin?.fetchTopicMetadata();

            return { topics: metadata?.topics || [] };

        } catch (error) {
            console.log('**********************error is: ', error);
            throw new Error("Error getting topic's metadata: " + error);
            // return [];
        } finally {
            await this.disconnect();
        }
    }

    async connect() {
        if (this.admin) {
            await this.admin.connect();
            console.log("Admin client connected.");
        }
    }

    async disconnect() {
        if (this.admin) {
            await this.admin.disconnect();
            console.log("Admin client disconnected.");
        }
    }
}
