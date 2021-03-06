import React, { useEffect, useRef, useState } from 'react'
import {motion} from "framer-motion"
import BeatLoader from "react-spinners/BeatLoader"
import VS from '../GameComponents/VS'
import Counter from '../GameComponents/Counter'
import Question from '../GameComponents/Question'
import GameFinished from '../GameComponents/GameFinished'

export default function Game({location}) {
  useEffect(() => {
    const socket = location.socket
    if (!socket) {
      window.open('/', '_self')
    }
    socket.on('game-cancelled', () => {
      setViewCounter(false)
      setView(<p>Your opponent has left the match. The match has now been cancelled. Redirecting...</p>)
      setTimeout(() => window.open('/', '_self'), 2000)
    })
    socket.emit('start-game')
    socket.on('players', ({players, first}) => {
      _setPlayers(players)
      if (location.leader && first) {
        const elorating = Math.log(location.user.elo)
        const difficulty = elorating > 4.3 ? "hard" : elorating > 3.5 ? "medium" : "easy"
        socket.emit('get-questions', difficulty)
      }
    })
    socket.on('category', ({category, index}) => {
      setTimeout(() => {
        setQuestionIndex(index)
        setView(<p>Loading</p>)
        setView(<Question category={category} question={null} answers={null} socket={socket} user={location.user} players={playersRef.current} leader={location.leader} answering={null}/>)
        
        if (location.leader) {
          socket.emit('start-timer', 5)
        }
      }, 3000)
      
    })
    socket.on('answer-question', ({id, question, answers}) => {
      if (id === location.user.id) {
        setView(<Question category={question.category} question={question} answers={answers} socket={socket} user={location.user} players={playersRef.current} leader={location.leader} answering={true}/>)
      } else setView(<Question category={question.category} question={question} answers={answers} socket={socket} user={location.user} players={playersRef.current} leader={location.leader} answering={null}/>)
    })
    socket.on('game-finished', () => {
      setTimeout(() => {
        setView(<GameFinished players={playersRef.current} user={location.user} ranked={location.ranked}/>)
        setViewCounter(false)
      }, 3000)
    })
    return () => {
      socket.off('players')
      socket.off('category')
      socket.off('answer-question')
      socket.off('game-cancelled')
      socket.off('game-finished')
    }
    //eslint-disable-next-line
  }, [])

  const [players, setPlayers] = useState()
  const [questionIndex, setQuestionIndex] = useState(0)
  const [view, setView] = useState("init")
  const playersRef = useRef(players)
  const [viewCounter, setViewCounter] = useState(true)

  const _setPlayers = data => {
    playersRef.current = data;
    setPlayers(data)
  }

  return (
    <>
      {viewCounter &&<Counter amount={questionIndex + 1}/>}
      
      {view === "init" ?
      <div className="flex flex-col items-center justify-center bg-gray-900 min-h-screen">
          {players ? <VS players={players} />
         : <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 0.5, duration: 0.5}}><BeatLoader color="white"/></motion.div> }
       </div>
      : <>{
      view}
      </>}
      
      
    </>
  )
}
