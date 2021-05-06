import React from 'react'
import { motion } from "framer-motion"

export default function CopiedBox() {
  return (
      <motion.div className="absolute left-0 right-0 m-auto w-48 h-12 bg-white mt-10 pt-3 text-center rounded-full shadow-md" initial={{translateY: -90}} animate={{translateY: 0}} exit={{opacity: 0}} >
        <p className="font-semibold">Copied to clipboard!</p>
      </motion.div>
      
    
  )
}
