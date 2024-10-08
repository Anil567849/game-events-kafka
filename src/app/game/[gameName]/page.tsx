'use client'
import ScoreCard from '@/_components/ScoreCard';
import React, { useEffect, useState } from 'react'

interface ScoreData {
    sport: string;
    score: string
}

function GameName({params}: {params: {gameName: string}}) {
    const [scores, setScores] = useState<Record<string, string>>({
      teamA: '',
      teamB: ''
    });
    const [loading, setLoading] = useState(true);
    const [numMatches, setNumMatches] = useState(0); // number of partitions == number of matches

    useEffect(() => {
        // getInitialScores();
        // Set up SSE for real-time updates
        getTopicMetadata();
        const eventSource = new EventSource('/api/kafka/scores');

        eventSource.onmessage = (event) => {
            const data: ScoreData = JSON.parse(event.data);
            if((data.sport).toLowerCase() === (params.gameName).toLowerCase()){
                const score = JSON.parse(data.score);
                setScores({teamA: score.x, teamB: score.y});  
            }          
        };

        return () => {
            eventSource.close();
        };
    }, [])
    
    if (loading) {
        return <div>Loading...</div>;
    }

    async function getInitialScores(){
        try {
            const url = "http://localhost:3000/api/kafka/initial-scores";
            const res = await fetch(url, {
                method: 'POST',
                body: JSON.stringify({topic: params.gameName})
            });
            const data: ScoreData[] = await res.json();
            const newScores = JSON.parse(data[0].score);
            setScores({teamA: newScores.x, teamB: newScores.y});
            console.log(newScores);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching initial scores:', error);
            setScores({teamA: '0', teamB: '0'});
            setLoading(false);
        }
    }

    async function getTopicMetadata(){
        try {
            const url = "http://localhost:3000/api/kafka/get-topic-metadata";
            const res = await fetch(url, {
                method: 'POST',
                body: JSON.stringify({topic: params.gameName})
            });
            const {topics} = await res.json();
            setNumMatches(topics[0].partitions.length);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching initial scores:', error);
            setScores({teamA: '0', teamB: '0'});
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen min-w-screen flex flex-col items-center justify-start p-8 bg-gradient-to-br from-purple-700 via-indigo-800 to-blue-900">

            <h1 className='text-2xl md:text-4xl font-extrabold text-center text-white mb-8 tracking-tight'>{params.gameName}</h1>

            <div className="grid grid-cols-3 gap-5">
                {
                    Array.from({ length: numMatches }).map((x, ind) => {
                        return <ScoreCard key={ind} topic={`Game: ${ind}`} score={scores} />
                    })
                }
            </div>
        </div>
    )
}

export default GameName