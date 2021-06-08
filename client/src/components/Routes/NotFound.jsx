import React from 'react'
import {motion} from 'framer-motion'
import bg from '../../img/bg.svg'
import FilledButton from '../FilledButton'

export default function NotFound() {
  return (
    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex flex-col justify-center items-center min-h-screen" style={{backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: '50% 50%'}}>
      <h1 className="font-bold text-9xl bg-gradient-to-r from-red-500 to-blue-700 bg-clip-text text-transparent pb-5">404</h1>
      <p className="text-center text-gray-700 text-2xl mb-10 font-medium">looks like that page doesn't exist</p>
      <FilledButton txt="home" onClick={() => window.open('/', '_self')} />
    </motion.div>
  )
}
