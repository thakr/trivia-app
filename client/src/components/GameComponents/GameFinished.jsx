import React, { useEffect, useState } from 'react'
import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti'

export default function GameFinished({players, user, ranked}) {
  const [winner, setWinner] = useState()
  useEffect(() => {
    console.log(players)
    if (players[0].points > players[1].points) {
      setWinner(players[0])
    }
    if (players[0].points < players[1].points) {
      setWinner(players[1])
    }
    if (players[0].points === players[1].points) setWinner("tie")
  }, [players, user])
  const { width, height } = useWindowSize()
  return (
    <div className="flex flex-col items-center justify-center bg-gray-900 min-h-screen text-center">
      {winner && winner.id === user.id ? <><h1 className="text-green-500 font-bold text-8xl sm:text-6xl">You won!</h1>
      {ranked && <p className="text-xl mt-4 text-green-600">elo: {players[players.findIndex(v => v.id === user.id)].elo} <span className={`${players[players.findIndex(v => v.id === user.id)].elo - user.elo < 0 ? "text-red-500" : "text-green-500"}`}>({players[players.findIndex(v => v.id === user.id)].elo - user.elo > 0 && "+"}{players[players.findIndex(v => v.id === user.id)].elo - user.elo})</span></p>}
      <Confetti
      width={width}
      height={height}
    />
    </> : winner === "tie" ? <><h1 className="text-gray-100 font-bold text-8xl sm:text-6xl">Its a tie.</h1>
    <p className="text-xl mt-4 text-gray-200">elo: {players[players.findIndex(v => v.id === user.id)].elo} <span className={`${players[players.findIndex(v => v.id === user.id)].elo - user.elo < 0 ? "text-red-500" : "text-green-500"}`}>({players[players.findIndex(v => v.id === user.id)].elo - user.elo})</span></p></> : <>
      <h1 className="text-red-500 font-bold text-8xl sm:text-6xl">You lost.</h1>
      {ranked && <p className="text-xl mt-4 text-red-600">elo: {players[players.findIndex(v => v.id === user.id)].elo} <span className={`${players[players.findIndex(v => v.id === user.id)].elo - user.elo < 0 ? "text-red-500" : "text-green-500"}`}>({players[players.findIndex(v => v.id === user.id)].elo - user.elo})</span></p>}
    </>}
    <a className="mt-3 text-gray-300 hover:text-gray-100 transition-colors ease-in-out duration-200 font-medium" href="/dashboard">dashboard</a>
    </div>
  )
}
