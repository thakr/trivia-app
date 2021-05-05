import React, {useState, useEffect} from 'react'
import JoinLobby from './JoinLobby'
import Game from './Game'
import Lobby from './Lobby'
import Loader from "react-loader-spinner";
import io from 'socket.io-client'
const socket = io(process.env.NODE_ENV === 'development' ? 'http://localhost:8080/' : '/')
const axios = require('axios')

export default function GamePage({match}) {
  const [loading, setLoading] = useState(false)
  const toLobby = () => setView(<Lobby socket={socket} startGame={startGame}/>)
  socket.on('start-game', (questions) => {
    setView(<Game socket={socket} questions = {questions} toLobby={toLobby}/>)
  })
  useEffect(() => {
    socket.emit('in-room', match.params.id)
    socket.on('no-room', () => {console.log('no room'); setView('No room was found.')})
  }, [match])
  const startGame = () => {
    setLoading(true)
    axios.get('https://opentdb.com/api.php?amount=10')
      .then(function (response) {
        if (response.data.results) {
          setLoading(false)
          socket.emit('start-game', response.data.results)
        };
      })
      .catch(function (error) {
        console.log(error);
      });
    
  }
  const handleJoinRoom = (username) => {
    socket.emit('join room', {'username': username, 'roomid': match.params.id})
    setView(<Lobby socket={socket} startGame={startGame}/>)
  }

  const [view, setView] = useState(<JoinLobby joinRoom={handleJoinRoom}/>)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-blue-700">
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-white shadow-xl px-10 py-8 rounded-xl max-w-2xl min-w-4">  
          {!loading? view : <Loader type="ThreeDots" color="#00BFFF" height={80} width={80} />}
        </div>
      </div>
    </div>  
  )
}
