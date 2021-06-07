import React, { useEffect, useRef, useState } from 'react'
import Timer from './Timer'
import Scoreboard from './Scoreboard'
import { motion, AnimatePresence } from "framer-motion"
import {BrowserView, MobileView} from 'react-device-detect';
import useSound from 'use-sound';
import CORRECT from "../../sounds/CORRECT.mp3"
import INCORRECT from "../../sounds/INCORRECT.mp3"

export default function Question({category, question, answers, socket, user, players, leader, answering}) {
  const [clicks, setClicks] = useState(0)
  const [able, setAble] = useState(true)
  const ableRef = useRef(able)
  const [answeringQuestion, setAnsweringQuestion] = useState()
  const answeringQuestionRef = useRef(answeringQuestion)
  const [answer, setAnswer] = useState()
  const [correctAnswer, setCorrectAnswer] = useState()
  const [time, setTime] = useState(5)
  const [timerDone, setTimerDone] = useState(false)
  const timerDoneRef = useRef(timerDone)
  const [playCorrect] = useSound(CORRECT, {volume:1})
  const [playIncorrect] = useSound(INCORRECT, {volume:1})
  const [ableTabChange, setAbleTabChange] = useState(true)
  const ableTabChangeRef = useRef(ableTabChange)
  const _setAbleTabChange = data => {
    ableTabChangeRef.current = data
    setAbleTabChange(data)
  }
  const _setAnsweringQuestion = data => {
    answeringQuestionRef.current = data
    setAnsweringQuestion(data)
  }
  const _setAble = data => {
    ableRef.current = data;
    setAble(data)
  }
  const _setTimerDone = data => {
    timerDoneRef.current = data
    setTimerDone(data)
  }

  const handleKeydown = (e) => {
    if (e.keyCode) {
      if (e.keyCode === 70 && !timerDoneRef.current) {
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
      _setAble(false)
    }

  }
  const handleTabChange = () => {
    if (answeringQuestionRef.current && ableTabChangeRef.current) {
      if (answeringQuestionRef.current.id === user.id) {
        console.log('tab change')
        socket.emit('stop-timer')
        socket.emit('no-answer-timer')
        _setAbleTabChange(false)
      }
    }
  }
  useEffect(() => {
    if (clicks === 5 && able) {
      _setAble(false)
      socket.emit('stop-timer')
      setTimeout(() => {
        socket.emit('buzz'); 
        socket.emit('start-timer', 10)
      }, 1000)
    }
  }, [clicks, able, socket])

  useEffect(() => {
    document.addEventListener("visibilitychange", handleTabChange)
    document.addEventListener("keydown", handleKeydown)
    document.addEventListener("touchstart", handleKeydown)
    socket.on('answer-question', fuser => {
      if (user.id !== fuser.id) {
        _setAble(false)
      }
      _setAnsweringQuestion(fuser)
    })
    socket.on('answer', correct => {
      setCorrectAnswer(correct)
    })
    socket.on('timer', (val) => {
      setTime(val)
    })
    socket.on('timer-done', () => {
      _setTimerDone(true)
      if (ableRef.current && leader) {
        socket.emit('answer-question', null)
      }
      if (answeringQuestionRef.current) {
        if (answeringQuestionRef.current.id === user.id) {
          socket.emit('no-answer-timer')
        }
      }
    })
    socket.on('user_answered', (answer) => {
      setAnswer(answer)
    })
    return () => {
      document.removeEventListener("keydown", handleKeydown)
      document.removeEventListener("visibilitychange", handleTabChange)
      setAnswer()
      setCorrectAnswer()
      _setAnsweringQuestion()
      setAnsweringQuestion()
      setClicks(0)
      _setAble(true)
      _setTimerDone(false)
      _setAbleTabChange(true)
      socket.off('timer')
      socket.off('timer-done')
      socket.off('answer')
    }
    
    //eslint-disable-next-line
  }, [])
  useEffect(() => {
    if (correctAnswer && answer) {
      correctAnswer === answer ? playCorrect() : playIncorrect()
    }
    if (correctAnswer && !answer) {
      playIncorrect()
    }
    //eslint-disable-next-line
  },[correctAnswer,answer])

  return (
    <>
      <div className="flex flex-col items-center justify-center bg-gray-900 min-h-screen text-center">
       <Timer time={time}/>
        {answering === null ?
        <> 
        {answeringQuestion ? <div>
          <motion.h1 initial={{opacity: 0}} animate={{opacity: 1}} className="text-gray-500 font-bold text-4xl">{answeringQuestion.username} is answering...</motion.h1>
          <motion.h1 initial={{opacity: 0}} animate={{opacity: 1}} className="text-gray-100 font-bold text-4xl sm:text-2xl mx-10 mt-5 overflow-wrap" dangerouslySetInnerHTML={{__html: question}}></motion.h1>
          <motion.div variants={Parent} initial="init" animate="load" className="mt-36 sm:mt-16 grid grid-cols-2 sm:grid-cols-1 h-64 mb-2 sm:overflow-auto">
            <AnimatePresence>
              {answers.map((v,i) => {
                return <motion.button key={v} variants={Main} animate={correctAnswer && correctAnswer === v ? "correct" : answer === v ? "incorrect" : {backgroundColor: "rgb(75,85,99)"}} className="bg-gray-600 m-5 px-24 h-16 rounded-lg text-gray-100 font-medium min-h-0 min-w-0 focus:outline-none" dangerouslySetInnerHTML={{__html: v}}></motion.button>
              })}
            </AnimatePresence>
          </motion.div>
        </div> :
        <>
        <motion.h1 initial={{opacity: 0}} animate={{opacity: 1}} className="text-gray-100 font-bold text-4xl mx-4" dangerouslySetInnerHTML={{__html: `Category: ${category}`}}></motion.h1> 
        <motion.div animate={timerDone && {opacity: 0}} transition={{duration: 0.1}} initial={{opacity: 1}} className="absolute bottom-20 sm:relative sm:top-10 w-4 mx-auto sm:flex sm:justify-center right-36 sm:right-auto">
          <div className="flex flex-row">
            <motion.h2 animate={{scale: [1,Math.sin(clicks)/10+.5,1]}} transition={{duration: 0.25}} className="text-gray-100 font-bold text-xl bg-black px-4 py-2 rounded-lg flex-1" style={{filter: "drop-shadow(5px 5px 4px #0a0a0a"}}><BrowserView>f</BrowserView><MobileView>tap</MobileView></motion.h2>
            <h2 className="text-gray-100 font-semibold text-2xl mt-1 ml-5 flex-1">{clicks}/5</h2>
          </div>
        </motion.div>
        </>}
        </>
        : 
        <div>
          <motion.h1 initial={{opacity: 0}} animate={{opacity: 1}} className="text-gray-100 font-bold text-4xl sm:text-2xl mx-10 mt-5 overflow-wrap" dangerouslySetInnerHTML={{__html: question}}></motion.h1>
          <motion.div variants={Parent} initial="init" animate="load" className="mt-36 sm:mt-16 grid grid-cols-2 sm:grid-cols-1 h-64 mb-2 sm:overflow-auto">
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