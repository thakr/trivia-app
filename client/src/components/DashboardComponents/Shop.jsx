import React from 'react'
import {motion} from 'framer-motion'

export default function Shop({user}) {
  return (
    <motion.div initial={{opacity: 0}} animate={{opacity: 1}}>
      <h1 className="text-6xl font-bold">W.I.P</h1>
    </motion.div>
  )
}
