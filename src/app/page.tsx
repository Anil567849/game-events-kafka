'use client'
import { useEffect, useState } from 'react';
import MainCard from '@/_components/MainCard';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {

    async function getAllTopics(){
      try {
        const res = await fetch("http://localhost:3000/api/kafka/get-topic");
        let {data}: {data: string[]} = await res.json();
        // console.log(data);
        data = data.filter((item) => item !== '__consumer_offsets');
        setTopics(data);
        console.log(data);
        
        setLoading(false);
      } catch (error) {
        console.log('error:', error);
      }      
    }

    getAllTopics();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center justify-start p-8 bg-gradient-to-br from-purple-700 via-indigo-800 to-blue-900">

      <h1 className='text-2xl md:text-4xl font-extrabold text-center text-white mb-8 tracking-tight'>Select a Game</h1>

      <div className="grid grid-cols-3 gap-5">
        {
          topics.map((topic, ind) => {
            return <MainCard key={ind} topic={topic}/>
          })
        }
      </div>
    </div>
  );
}