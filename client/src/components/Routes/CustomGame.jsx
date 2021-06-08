import React, { useEffect, useRef, useState } from 'react'
import queryString from 'query-string'
import { useHistory, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion"
import BarLoader from "react-spinners/BarLoader";
import io from 'socket.io-client'
import CopiedBox from '../CopiedBox'

export default function CustomGame() {
  const history = useHistory();
  const location = useLocation();
  const variants = {
    on: { opacity: 1 },
    off: { opacity: 0.2 }
  }

  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState()
  const [user, setUser] = useState()
  const [link, setLink] = useState()
  const [showCopied, setShowCopied] = useState(false)
  const [invalidLink, setInvalidLink] = useState(false)
  const userRef = useRef(user)
  const _setUser = data => {
    userRef.current = data
    setUser(data)
  }
  const copyText = () => {
    navigator.clipboard.writeText(link); 
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 1000)
  }
  useEffect(() => {
    let socket = io(process.env.NODE_ENV === 'development' ? 'http://localhost:8080/' : '/')
    let cleanup = true
    if (queryString.parse(location.search).roomid) socket.emit('custom-matchmake', {token: localStorage.getItem('token'), roomid: queryString.parse(location.search).roomid})
    else socket.emit('custom-matchmake', {token: localStorage.getItem('token'), roomid: null})
    socket.on('user-from-token', (user) => {
      _setUser(user)
    })
    socket.on('custom-room-id', (roomid) => {
      setLink(process.env.NODE_ENV === 'development' ? `http://localhost:3000/custom-game?roomid=${roomid}` : `https://triviahit.games/custom-game?roomid=${roomid}`)
    })
    socket.on('no-room-found', () => {
      setInvalidLink(true)
    })
    socket.on('same-person', () => {
      setInvalidLink(true)
    })
    socket.on('game-starting', (isLeader) => {
      setLoading(false)
      let timer = 3
      const cdtimer = setInterval(() => {
        setCountdown(timer)
        if (timer === 0) {
          clearInterval(cdtimer)
          cleanup = false
          history.push({pathname: '/game', leader: isLeader, socket: socket, user: userRef.current, ranked: false})
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
      socket.off('game-cancelled')
      socket.off('expired-token')
      socket.off('no-token')
      socket.off('error')
      socket.off('custom-room-id')
      if (cleanup) socket.disconnect() 
    } //eslint-disable-next-line
  }, [])
  return (
    <>
      <AnimatePresence>
        {showCopied && <CopiedBox />}
      </AnimatePresence> 
      <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex flex-col bg-gray-900 min-h-screen items-center justify-center">    
        {countdown && <motion.h2 className="absolute font-semibold text-8xl text-gray-100" initial={{scale: 0}} animate={{scale: 1}}>{countdown}</motion.h2>}
        <motion.h1 className={`font-bold text-white text-6xl sm:text-5xl text-center`} animate={countdown ? "off" : "on"} variants={variants} transition={{duration: 0.25}}>{invalidLink ? <span className="text-red-500">That link is invalid :(</span> : loading? <>Waiting for opponent</> : <>Game Starting</>}</motion.h1>
        {!invalidLink && <BarLoader color="#ffffff" loading={loading} width={300} css={`margin-top:2em; margin-bottom:1em; border-radius:2px`}/>}
        {!queryString.parse(location.search).roomid && <motion.p className={`font-medium text-white text-2xl sm:text-2xl mt-5 text-center`} animate={countdown ? "off" : "on"} variants={variants} transition={{duration: 0.25}}>Share this link with a friend: {link ? <span className="text-green-400 overflow-wrap cursor-pointer hover:text-green-300 transition-colors ease-in-out duration-200 " onClick={copyText}>{link}</span> : "..."}</motion.p>}
        {invalidLink && <a className="mt-5 text-gray-300 hover:text-gray-100 transition-colors ease-in-out duration-200 font-medium" href="/dashboard">dashboard</a>}
      </motion.div>
    </>
  )
}
