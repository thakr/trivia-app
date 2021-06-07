import React, { useEffect, useRef, useState } from 'react'
import BarLoader from "react-spinners/BarLoader";
import { useHistory } from "react-router-dom";
import { motion } from "framer-motion"
import io from 'socket.io-client'
import useSound from 'use-sound';
import thbgloop from "../../sounds/thbgloop.mp3"
import matchfound from "../../sounds/matchfound.mp3"
const axios = require('axios')

export default function FindMatch() {
  const history = useHistory();
  const variants = {
    on: { opacity: 1 },
    off: { opacity: 0.2 }
  } 
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState()
  const [user, setUser] = useState()
  const [inQueue,setInQueue] = useState(false)
  const [volume, setVolume] = useState(.7)
  const [play, { isPlaying, sound }] = useSound(thbgloop, { volume: volume })
  const [playMf, {sound: soundMf}] = useSound(matchfound, {volume: 0})
  const socketRef = useRef()
  const userRef = useRef(user)
  const _setUser = data => {
    userRef.current = data
    setUser(data)
  }
  const handleJoinQueue = () => {
    socketRef.current.emit('matchmake',localStorage.getItem('token'))
    setInQueue(true)
    if (!isPlaying) {
      sound.fade(0,0.5,1000)
      play()
      playMf()
      sound.loop(true)
      soundMf.loop(true)
    }
  }
  useEffect(() => {
    let socket = io(process.env.NODE_ENV === 'development' ? 'http://localhost:8080/' : '/')
    socketRef.current=socket
    let cleanup = true
    axios.get(process.env.NODE_ENV === 'development' ? `http://localhost:8080/api/userinfo?token=${localStorage.getItem('token')}` : `/api/userinfo?token=${localStorage.getItem('token')}`)
    .then(res => {
      if (res.data.error && res.data.msg) history.push({pathname: '/login', defaultMsg: res.data.msg})
      _setUser(res.data.user)
      if (res.data.newToken) localStorage.setItem("token", res.data.newToken)
    })
    socket.on('found-match', (isLeader) => {
      setLoading(false)
      if (sound && soundMf) {
        sound.fade(0.5,0,500)
        setTimeout(() => {
          sound.stop();
          soundMf.seek(0);
          soundMf.volume(1);
          soundMf.loop(false);
          },500)
      } 
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
      if (cleanup) socket.disconnect() 
    } //eslint-disable-next-line
  }, [sound, soundMf])

  return (
    <>
      <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex flex-col bg-gray-900 min-h-screen items-center justify-center">      
        {countdown && <motion.h2 className="absolute font-semibold text-8xl text-gray-100" initial={{scale: 0}} animate={{scale: 1}}>{countdown}</motion.h2>}
        {inQueue ? <>
          <div className="absolute top-5 right-5 flex">
            <img src={`https://img.icons8.com/small/32/ffffff/${volume > 0 ? "high-volume" : "mute"}.png`} alt="volume" className="mr-5 cursor-pointer" onClick={() => volume > 0 ? setVolume(0) : setVolume(.7)}/>
            <input
              type="range"
              min={0}
              max={1}
              step={.02}
              value={volume}
              onChange={event => setVolume(event.target.valueAsNumber)}
              
            ></input>
          </div>
          <motion.h1 className={`font-bold text-white text-6xl sm:text-5xl`} animate={countdown ? "off" : "on"} variants={variants} transition={{duration: 0.25}}>{loading? <>Matchmaking</> : <>Match Found</>}</motion.h1>
          <BarLoader color="#ffffff" loading={loading} width={300} css={`margin-top:2em; border-radius:2px`}/>
        </>:<>
        <h1 className="text-center text-7xl mb-10 font-bold"><span className="text-white">trivia</span><span className="text-blue-500">hit</span></h1>
        <div className="flex items-center justify-center sm:flex-col">
          <h2 className="font-bold text-white text-4xl sm:text-5xl mr-10 sm:mr-0 sm:mb-5">elo: {user && user.elo}</h2>
          <button onClick={handleJoinQueue} className="text-md outline-none focus:outline-none bg-gray-800 border-gray-800 text-gray-100 font-semibold px-4 py-2 rounded-xl shadow-md cursor-pointer hover:bg-gray-100 hover:border-gray-100 hover:text-gray-800 border-4 transition:ease-in-out duration-200 h-14 w-30 text-xl">join queue</button>
        </div></>}
        
        {/* <p onClick={() => bgAudio.play()}>eawg</p> */}
      </motion.div>
    </>
  )
}
