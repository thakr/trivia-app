import React, { useEffect, useRef, useState } from 'react'
import Timer from './Timer'
import Scoreboard from './Scoreboard'
import { motion, AnimatePresence } from "framer-motion"
import {BrowserView, MobileView} from 'react-device-detect';


export default function Question({category, question, answers, socket, user, players, leader}) {
  const [clicks, setClicks] = useState(0)

  const [able, setAble] = useState(true)
  const ableRef = useRef(able)
  const [answeringQuestion, setAnsweringQuestion] = useState()
  const [answer, setAnswer] = useState()
  const [correctAnswer, setCorrectAnswer] = useState()
  const [time, setTime] = useState(5)
  const _setAble = data => {
    ableRef.current = data;
    setAble(data)
  }
  const handleKeydown = (e) => {
    if (e.keyCode) {
      if (e.keyCode === 70) {
        setClicks(prev => {
          if (prev === 5) return 5
          else if (ableRef.current) return prev + 1
          else return prev
        })
      }
    } else {
      setClicks(prev => {
          if (prev === 5) return 5
          else if (ableRef.current) return prev + 1
          else return prev
        })
    }
  }

  const Main = {
    "init": {
      opacity: 0, 
      y: 25
    },
    "load": {
      opacity: 1,
      y: 0
    },
    "correct": {
      backgroundColor: "green",
      transition: {
        duration: 1,
      },
    },
    "incorrect": {
      backgroundColor: "red",
      transition: {
        duration: 1,
      },
    },
  }
  const Parent = {
    "init": {
      opacity: 0, 
    },
    "load": {
      opacity: 1,
      transition: {
        duration: 0.5, 
        ease: "easeInOut", 
        staggerChildren: 0.5
      }
    }
  }
  const handleClick = (ans) => {
    if (!answer) {
      socket.emit('stop-timer')
      socket.emit('answer-question', ans)
      setAnswer(ans)
      _setAble(false)
    }

  }
  useEffect(() => {
    if (clicks === 5 && able) {
      _setAble(false)
      console.log('sending buzz timer')
      setTimeout(() => {socket.emit('buzz'); socket.emit('start-timer', 10)}, 1000)
    }
  }, [clicks, able, socket])

  useEffect(() => {
    document.addEventListener("keydown", handleKeydown)
    document.addEventListener("touchstart", handleKeydown)
    socket.on('answer-question', fuser => {
      if (user.id !== fuser.id) {
        _setAble(false)
        setAnsweringQuestion(fuser.username)
      }
    })
    socket.on('answer', correct => {
      setCorrectAnswer(correct)
    })
    socket.on('timer', (val) => {
      setTime(val)
    })
    socket.on('timer-done', () => {
      console.log('timer done')
      if (leader && able) {
        console.log(leader)
        socket.emit('answer-question', null)
      }
    })
    return () => {
      document.removeEventListener("keydown", handleKeydown)
      setAnswer()
      setCorrectAnswer()
      setAnsweringQuestion()
      setClicks(0)
      setAble(true)
    }
    
    //eslint-disable-next-line
  }, [])

  
  return (
    <>
      <div className="flex flex-col items-center justify-center bg-gray-900 min-h-screen text-center">
       <Timer time={time}/>
        {question === null ?
        <> 
        {answeringQuestion ? <h1 className="text-gray-100 font-bold text-4xl">{answeringQuestion} is answering...</h1> :
        <>
        <motion.h1 initial={{opacity: 0}} animate={{opacity: 1}} className="text-gray-100 font-bold text-4xl mx-4" dangerouslySetInnerHTML={{__html: `Category: ${category}`}}></motion.h1> 
        <div className="absolute sm:relative sm:top-10 bottom-20 w-4 mx-auto sm:flex sm:justify-center right-36 sm:right-auto">
          <div className="flex flex-row">
            <motion.h2 animate={{scale: [1,Math.sin(clicks)/10+.5,1]}} transition={{duration: 0.25}} className="text-gray-100 font-bold text-xl bg-black px-4 py-2 rounded-lg flex-1" style={{filter: "drop-shadow(5px 5px 4px #0a0a0a"}}><BrowserView>f</BrowserView><MobileView>tap</MobileView></motion.h2>
            <h2 className="text-gray-100 font-semibold text-2xl mt-1 ml-5 flex-1">{clicks}/5</h2>
          </div>
        </div>
        </>}
        </>
        : 
        <div>
          <motion.h1 initial={{opacity: 0}} animate={{opacity: 1}} className="text-gray-100 font-bold text-4xl sm:text-2xl mx-10 mt-5 overflow-wrap" dangerouslySetInnerHTML={{__html: question}}></motion.h1>
          <motion.div variants={Parent} initial="init" animate="load" className="mt-36 sm:mt-16 grid grid-cols-2 sm:grid-cols-1 min-h-64 max-h-64 mb-2 sm:overflow-auto">
            <AnimatePresence>
              {answers.map((v,i) => {
                return <motion.button key={v} onClick={() => handleClick(v)} variants={Main} animate={correctAnswer && correctAnswer === v ? "correct" : answer === v ? "incorrect" : {backgroundColor: "rgb(55,65,81)"}} className="bg-gray-700 m-5 px-24 h-16 rounded-lg text-gray-100 font-medium min-h-0 min-w-0 focus:outline-none" dangerouslySetInnerHTML={{__html: v}}></motion.button>
              })}
            </AnimatePresence>
          </motion.div>
        </div>
        }
        {players && <Scoreboard users={players} />}
      </div>
      
    </>
  )
}