import { motion } from "framer-motion"

export default function BasketBall({score}: {score: string}) {
  return (
    <div className="">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-3xl p-8 shadow-2xl"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold text-center text-white mb-8 tracking-tight">
          Basket Ball
        </h1>
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
            className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500"
          >
            {score}
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-4 text-xl md:text-2xl font-semibold text-blue-200"
          >
            Points
          </motion.div>
        </div>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-8 h-1 bg-gradient-to-r from-green-300 via-blue-500 to-purple-600"
        ></motion.div>
      </motion.div>
    </div>
  )
}