import React, { useEffect, useRef, useState } from 'react'
import BarLoader from "react-spinners/BarLoader";
import { useHistory } from "react-router-dom";
import { motion } from "framer-motion"
import io from 'socket.io-client'
// redirect if no user
export default function FindMatch() {
  const history = useHistory();

  const variants = {
    on: { opacity: 1 },
    off: { opacity: 0.2 }
  }

  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState()
  const [user, setUser] = useState()
  const userRef = useRef(user)
  const _setUser = data => {
    userRef.current = data
    setUser(data)
  }
  useEffect(() => {
    let socket = io(process.env.NODE_ENV === 'development' ? 'http://localhost:8080/' : '/')
    let cleanup = true
    socket.emit('matchmake', localStorage.getItem('token'))
    socket.on('user-from-token', (user) => {
      _setUser(user)
    })
    socket.on('found-match', (isLeader) => {
      setLoading(false)
      let timer = 3
      const cdtimer = setInterval(() => {
        setCountdown(timer)
        if (timer === 0) {
          clearInterval(cdtimer)
          cleanup = false
          history.push({pathname: '/game', leader: isLeader, socket: socket, user: userRef.current})
        }
        timer --
      }, 1000)
    })
    socket.on('game-cancelled', () => {
      window.open('/', '_self')
    })
    socket.on('expired-token', () => {
      history.push({pathname: '/login', defaultMsg: "session has expired"})
    })
    socket.on('no-token', () => {
      history.push({pathname: '/login', defaultMsg: "please log in"})
    })
    socket.on('error', () => {
      history.push({pathname: '/login', defaultMsg: "an error occured"})
    })
    return () => {
      if (cleanup) socket.disconnect() 
    } //eslint-disable-next-line
  }, [])
  return (
    <>
      <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex flex-col bg-gray-900 min-h-screen items-center justify-center">      
        {countdown && <motion.h2 className="absolute font-semibold text-8xl text-gray-100" initial={{scale: 0}} animate={{scale: 1}}>{countdown}</motion.h2>}
        <motion.p className="text-gray-100" animate={countdown ? "off" : "on"} variants={variants} transition={{duration: 0.25}}>{user && user.elo}</motion.p>
        <motion.h1 className={`font-bold text-white text-6xl sm:text-5xl`} animate={countdown ? "off" : "on"} variants={variants} transition={{duration: 0.25}}>{loading? <>Matchmaking</> : <>Match Found</>}</motion.h1>
        <BarLoader color="#ffffff" loading={loading} width={300} css={`margin-top:2em; border-radius:2px`}/>
      </motion.div>
    </>
  )
}
