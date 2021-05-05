import React, {useEffect, useState} from 'react';
import Score from './Score'
import Answers from './Answers'


export default function Game({socket,questions, toLobby}) {
  
  const [answers,setAnswers] = useState([])
  const [index, setIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const [picked, setPicked] = useState('')
  const [usersData, setUsersData] = useState([])

  useEffect(() => {
    console.log(index)
    if (index < 10) {
      console.log('hi')
      //socket.emit('start-timer')
    } else {
      console.log('FINISHED GAME')
    }
  }, [index])
  const shuffleAnswers = (arr) => {
    arr.sort(() => (Math.random() > .5) ? 1 : -1);
    return(arr)
  }

  useEffect(() => {
    
    socket.on('all-users-finished-question', (nextQIndex) => {
      
      if (index < 10) {
        console.log(nextQIndex)
        setTimeout(() => {
          console.log('calling')
          setPicked('')
          setFinished(false)
          setIndex(nextQIndex) 
        }, 1000)
      } 
      
    })
    socket.on('get-users-data', (users) => {
      setUsersData(users)
    })
    socket.on('timer-finished', () => {
      if (finished !== true) {
        socket.emit('user-finished', {'correct': false, 'questionIndex': index})
        setFinished(true)
      }
    })
  // eslint-disable-next-line
  }, [])
  
  
  const handleAnswer = (ans, cor_ans) => {
    if (finished !== true) {
      if (ans === cor_ans) {
        socket.emit('user-finished', {'correct': true, 'questionIndex': index}) 
      } else {
        socket.emit('user-finished', {'correct': false, 'questionIndex': index})
      }
      setPicked(ans)
      setFinished(true)
      
    }
    
  }

  return (
    <div>
      {index < 10 ? <>
        {!answers.includes(questions[index].correct_answer) && setAnswers(shuffleAnswers([...questions[index].incorrect_answers, questions[index].correct_answer]))}
        {answers[0] !== undefined && 
        <>
          <Score socket={socket} index={index} />
          <h1 className="font-bold text-2xl text-center mt-2">{questions[index].category} ({questions[index].difficulty})</h1>
          <p className="mt-4 text-center" dangerouslySetInnerHTML={ {__html: questions[index].question} }></p>
          <Answers handleAnswer={handleAnswer} answers={answers} question={questions[index]} finished={finished} picked={picked}/>
          {usersData.map(v => {
            return(`${v.username}: ${v.points} \n`)
          })}
        </> }
      </> : 
      <>
      <p>Quiz finished. Leaderboard: <br />
      {usersData.map(v => {
        return(<p>{v.username}: {v.points}</p>)
      })}
      </p>
      <p className="cursor-pointer" onClick={toLobby}>Back to lobby</p>
      </>
      }

    </div>
  )
}
