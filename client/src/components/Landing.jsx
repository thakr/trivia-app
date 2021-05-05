import React, {useState} from 'react'
import bg from '../img/bg.svg'
const axios = require('axios')

export default function Landing() {

  const [buttonInput, setButtonInput] = useState(false)
  const [roomid, setRoomId] = useState('')
  const handleStartRoom = () => {
    axios.get(process.env.NODE_ENV === 'development' ? 'http://localhost:8080/api/get-room' : '/api/get-room')
      .then(function (response) {
        if (response) {
          window.open(`/room/${response.data.room}`, '_self')
        };
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  const formSubmit = (event) => {
    event.preventDefault()
    window.location.replace(`/room/${roomid}`)
  }
  return (   
    <div className="flex flex-col justify-center items-center min-h-screen" style={{backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: '50% 50%'}}>
      {buttonInput ? <><div className="flex justify-items-center items-center text-center bg-white p-8 rounded-lg shadow-lg">
      <form onSubmit={formSubmit}>
        <input required maxlength="20" value={roomid} onChange={(event) => setRoomId(event.target.value)} type = "text" name="roomid" placeholder="room id" autoComplete="off" className="border border-gray-400 rounded-lg px-4 py-2 mr-5 outline-none focus:ring-2 ring-blue-400 transition-ring ease-in-out duration-75 sm:mx-2 sm:my-4"/>
        <input className = "text-md bg-gray-800 text-white font-semibold px-4 py-2 rounded-lg shadow-md cursor-pointer transform hover:scale-105 transition-transform:ease-in-out duration-75" type = "submit" value = "join"/>
      </form>
      
    </div><p className="mt-4 cursor-pointer" onClick={() => setButtonInput(!buttonInput)}>← Go back</p></>: <><div className="flex items-center text-center sm:flex-col">
      
      <h1 className="font-bold text-7xl">trivia<span className="text-blue-700">hit</span></h1>
      <div className="ml-24 sm:ml-0 sm:mt-5 outline-none">
        <button onClick={() => setButtonInput(!buttonInput)} className = "text-md outline-none focus:outline-none border-4 border-gray-500 text-gray-500 hover:text-gray-800 hover:border-gray-800 font-semibold px-4 py-2 rounded-xl shadow-md cursor-pointer hover:text-white transition:ease-in-out duration-200 h-14 w-30 text-xl mr-5">join room</button>
        <button onClick={handleStartRoom} className = "text-md outline-none focus:outline-none bg-gray-800 border-gray-800 text-white font-semibold px-4 py-2 rounded-xl shadow-md cursor-pointer hover:bg-transparent hover:text-gray-800 border-4 transition:ease-in-out duration-200 h-14 w-30 text-xl">start room</button>
      </div>
    </div>
    <p className="mt-10 text-center mx-4 text-gray-700">triviahit is an online multiplayer trivia game where players answer a series of 10 questions and compete to get the best score.</p>
    <p className="mt-5 text-center mx-4 text-gray-700">This is an open source project created by Shaan Thakker. View the source code on <a className="underline" target="_blank" rel="noreferrer" href='https://github.com/demolite-stm/trivia-app'>GitHub</a>.</p>
  </>}
      </div>
  )
}
