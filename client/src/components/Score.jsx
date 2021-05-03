import React, {useState, useEffect} from 'react'

export default function Score({socket, index,}) {
  const [seconds, setSeconds] = useState(20)
  const [score, setScore] = useState(0)

  useEffect(() => {
    socket.on('timer-change', (secs) => {
      setSeconds(secs)
    })
    socket.on('score-change', (score) => {
      setScore(score)
    })
  }, [])
  return (
    <div className="flex justify-between">
      <p className="mb-2">{index+1}/10</p>
      {seconds}s
      <p>Score: {score}</p>
    </div>
  )
}
