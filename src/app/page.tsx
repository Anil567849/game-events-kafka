'use client'
import { useEffect, useState } from 'react';
import BasketBall from "./(home)/@basketball/page";
import Soccer from "./(home)/@soccer/page";

interface ScoreData {
  sport: string;
  score: string
}

export default function Home() {
  const [scores, setScores] = useState<Record<string, string>>({
    soccer: '',
    basketball: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial scores
    fetch('/api/kafka/initial-scores')
      .then(response => response.json())
      .then((data: ScoreData[]) => {
        console.log('data', data);
        
        const newScores = { ...scores };
        data.forEach(item => {
          newScores[item.sport] = item.score;
        });
        setScores(newScores);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching initial scores:', error);
        setLoading(false);
      });

    // Set up SSE for real-time updates
    const eventSource = new EventSource('/api/kafka/scores');

    eventSource.onmessage = (event) => {
      const data: ScoreData = JSON.parse(event.data);
      setScores(prevScores => ({
        ...prevScores,
        [data.sport]: data.score
      }));
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-700 via-indigo-800 to-blue-900">
      <div className="grid grid-cols-2 gap-5">
        <BasketBall score={scores.basketball} />
        <Soccer score={scores.soccer} />
      </div>
    </div>
  );
}