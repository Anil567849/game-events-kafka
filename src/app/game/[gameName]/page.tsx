'use client'
import ScoreCard from '@/_components/ScoreCard';
import React, { useEffect, useState } from 'react'

export interface ScoreData {
    sport: string;
    score: string;
    partition: number;
}

interface KafkaPartitionMetadata {
    isr: number[];               // In-Sync Replicas (ISR) - list of broker IDs that are in sync
    leader: number;              // Leader broker ID for this partition
    offlineReplicas: number[];   // List of broker IDs that are offline for this partition
    partitionErrorCode: number;  // Error code related to this partition (0 means no error)
    partitionId: number;         // Unique ID of the partition
    replicas: number[];          // List of all replicas for this partition
  }

function GameName({params}: {params: {gameName: string}}) {
    const [scores, setScores] = useState<{partitionId: number, teamA: string, teamB: string}[]>([]);
    const [loading, setLoading] = useState(true);
    const [topicMetaData, setTopicMetaData] = useState<KafkaPartitionMetadata[]>([]);


    useEffect(() => {
      console.log(scores);
    }, [scores])
    

    useEffect(() => {
        // getInitialScores();
        // Set up SSE for real-time updates
        getTopicMetadata();
        const eventSource = new EventSource('/api/kafka/scores');

        eventSource.onmessage = (event) => {
            const data: ScoreData = JSON.parse(event.data);
            if((data.sport).toLowerCase() === (params.gameName).toLowerCase()){
                console.log(data);
                
                const score = JSON.parse(data.score);
                setScores((prev) => {
                    const item = prev.filter((p) => p.partitionId == data.partition);
                    if(item.length == 1){
                        item[0].teamA = score.x;
                        item[0].teamB = score.y;
                        return prev;
                    }else{
                        let obj = {partitionId: data.partition, teamA: score.x, teamB: score.y}
                        return [...prev, obj]
                    }


                });  
            }          
        };

        return () => {
            eventSource.close();
        };
    }, [])
    
    if (loading) {
        return <div>Loading...</div>;
    }

    // async function getInitialScores(){
    //     try {
    //         const url = "http://localhost:3000/api/kafka/initial-scores";
    //         const res = await fetch(url, {
    //             method: 'POST',
    //             body: JSON.stringify({topic: params.gameName})
    //         });
    //         const data: ScoreData[] = await res.json();
    //         const newScores = JSON.parse(data[0].score);
    //         setScores({teamA: newScores.x, teamB: newScores.y});
    //         console.log(newScores);
    //         setLoading(false);
    //     } catch (error) {
    //         console.error('Error fetching initial scores:', error);
    //         setScores({teamA: '0', teamB: '0'});
    //         setLoading(false);
    //     }
    // }

    async function getTopicMetadata(){
        try {
            const url = "http://localhost:3000/api/kafka/get-topic-metadata";
            const res = await fetch(url, {
                method: 'POST',
                body: JSON.stringify({topic: params.gameName})
            });
            const {topics} = await res.json();
            let arr: KafkaPartitionMetadata[] = topics[0].partitions;
            arr.sort((a, b) => a.partitionId - b.partitionId)
            setTopicMetaData(arr);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching initial scores:', error);
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen min-w-screen flex flex-col items-center justify-start p-8 bg-gradient-to-br from-purple-700 via-indigo-800 to-blue-900">

            <h1 className='text-2xl md:text-4xl font-extrabold text-center text-white mb-8 tracking-tight'>{params.gameName}</h1>

            <div className="grid grid-cols-3 gap-5">
                {
                    topicMetaData.map((item: KafkaPartitionMetadata, ind) => {
                        const s = scores.filter((s) => s.partitionId == item.partitionId);
                        return s ? <ScoreCard key={item?.partitionId} topic={`Game: ${item.partitionId}`} score={s[0]} /> :
                        <ScoreCard key={item?.partitionId} topic={`Game: ${item.partitionId}`} score={{partitionId: -1, teamA: '0', teamB: '0'}} />
                    })
                }
            </div>
        </div>
    )
}

export default GameName