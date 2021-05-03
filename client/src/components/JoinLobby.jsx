import React, {useState} from 'react'

export default function JoinLobby({joinRoom}) {
  const [username, setUsername] = useState('')
  const sendSocket = (event) => {
    event.preventDefault()
    joinRoom(username)
  }
  const handleUsernameChange = (event) => {
    event.preventDefault()
    setUsername(event.target.value)
  }
  return (
    <div className="flex justify-items-center items-center min-h-full min-w-full text-center">
      <form onSubmit={sendSocket}>
        <input required maxlength="20" type = "text" name="username" placeholder="username" value={username} onChange={handleUsernameChange} autoComplete="off" className="border border-gray-400 rounded-lg px-4 py-2 mr-5 outline-none focus:ring-2 ring-blue-400 transition-ring ease-in-out duration-75 sm:mx-2 sm:my-4"/>
        <input className = "text-md bg-gray-800 text-white font-semibold px-4 py-2 rounded-lg shadow-md cursor-pointer transform hover:scale-105 transition-transform:ease-in-out duration-75" type = "submit" value = "join"/>
      </form>
    </div>
  )
}
