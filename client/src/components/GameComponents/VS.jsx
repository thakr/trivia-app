import React from 'react'
import {motion} from "framer-motion"

export default function VS({players}) {

  const Main = {
    "init": {
      opacity: 0, 
    },
    "load": {
      opacity: 1,
      transition: {
        delayChildren: 1,
        duration: 0.5, 
        ease: "easeInOut", 
        staggerChildren: 0.5
      }
    }
  }

  const ChildElems = {
    "init": {
      opacity: 0, 
      y: 25
    },
    "load": {
      opacity: 1,
      y: 0
    }
  }
  return (
    <div className="flex flex-col items-center justify-center">
      <motion.h1 initial={{scale: 0}} animate={{scale: 1}} transition={{duration: 0.5, ease:"backOut"}} className="font-bold text-7xl mb-10"><span className="text-white">trivia</span><span className="text-blue-500">hit</span></motion.h1>
      <motion.div initial="init" animate="load" variants={Main} className="flex flex-row sm:flex-col items-center">
        <motion.div variants={ChildElems} className="text-center">
          <h1 className="text-gray-100 font-bold text-4xl">{players[0].username}</h1>
          <h2 className="text-gray-100 font-normal text-2xl">elo: {Math.floor(players[0].elo)}</h2>
        </motion.div>
        <motion.h1 variants={ChildElems} className="text-gray-100 font-bold text-4xl mx-10 sm:my-10">VS</motion.h1>
        <motion.div variants={ChildElems} className="text-center">
          <h1 className="text-gray-100 font-bold text-4xl">{players[1].username}</h1>
          <h2 className="text-gray-100 font-normal text-2xl">elo: {Math.floor(players[1].elo)}</h2>
        </motion.div>
      </motion.div>
    </div>
  )
}
