import { Admin } from "kafkajs";
import { kafkaClient } from ".";


export class kafkaAdmin {
    admin: Admin | null = null;

    constructor(){
        this.admin = kafkaClient.admin();
    }

    async getTopicList(): Promise<String[]> {
        try {
            const topics = await this.admin?.listTopics() as String[];
            return topics;
        } catch (error) {
            throw new Error("Error fetching topic list: " + error);
        } finally {
            await this.disconnect();
        }
    }

    async createTopic(topic: string, partition: number): Promise<boolean> {
        try {
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

    async disconnect() {
        if (this.admin) {
            await this.admin.disconnect();
            console.log("Admin client disconnected.");
        }
    }
}
