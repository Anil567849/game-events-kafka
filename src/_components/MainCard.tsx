'use client';
import { motion } from "framer-motion"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MainCard({topic}: {topic: string}) {
  const [heading, setHeading] = useState(topic);

  useEffect(() => {
    if (topic) {
      const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1).toLowerCase();
      setHeading(capitalizedTopic);
    }
  }, [topic]);

  const router = useRouter();
  function handleClick() {
    const slug = topic.toLowerCase();
    router.push(`http://localhost:3000/game/${slug}`)
  }
  return (
    <div onClick={handleClick} style={{ cursor: 'pointer' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-3xl p-8 shadow-2xl cursor-pointer"
      >
        <h1 className="text-2xl md:text-4xl font-extrabold text-center text-white mb-8 tracking-tight">
          {heading}
        </h1>
      </motion.div>
    </div>
  )
}