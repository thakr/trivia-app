import React, { useState,useEffect } from 'react'
import { motion } from 'framer-motion'
import BeatLoader from "react-spinners/BeatLoader"
import {useHistory, useLocation} from 'react-router-dom'
import AlertError from '../AlertError'
const axios = require('axios')

export default function Login({defaultView}) {
  let location = useLocation()
  const [view,setView] = useState(defaultView)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [sending, setSending]= useState(false)
  const [errorTxt, setErrorTxt] = useState(location && location.defaultMsg)

  useEffect(() => {
    if (localStorage.getItem("token") && !location.defaultMsg) {
      window.open('/dashboard', '_self')
    }
    //eslint-disable-next-line
  }, [])
  

  const handleLogin = (e) => {
    setSending(true)
    e.preventDefault()
    axios.post(process.env.NODE_ENV === "development" ? "http://localhost:8080/api/login" : "/api/login", {
      email: email,
      password: password
    })
    .then((res) => {
      if (res.data.error && res.data.msg) {
        setErrorTxt(res.data.msg)
        setSending(false)
      } else {
        console.log(res.data)
        localStorage.setItem('token', res.data.token)
        window.open('/dashboard', '_self')
      }
    })
    .catch((err) => console.log(err))
  }
  const handleSignup = (e) => {
    setSending(true)
    e.preventDefault()
    axios.post(process.env.NODE_ENV === "development" ? "http://localhost:8080/api/signup" : "/api/signup", {
      username: username,
      password: password,
      email: email
    })
    .then((res) => {
      if (res.data.error && res.data.msg) {
        console.log(res.data.msg)
        setErrorTxt(res.data.msg)
        setSending(false)
      } else {
        console.log(res.data)
        localStorage.setItem('token', res.data.token)
        window.open('/dashboard', '_self')
      }
    })
    .catch((err) => console.log(err))
  }
  let history = useHistory()
  return (
    <div className="min-w-screen min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-gray-100">
      <div className="bg-gray-100 shadow-xl rounded-xl py-16 px-24 sm:px-8">
      <h1 className="font-bold text-7xl bg-gradient-to-r from-red-500 to-blue-700 bg-clip-text text-transparent pb-5">{view}</h1>
      {errorTxt && <AlertError msg={errorTxt} removeAlert={() => setErrorTxt()}/>}
      {view === "login" ? <>
        <form onSubmit={handleLogin}>
          <input required maxLength="27" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="email" className="px-2 py-2 ring-blue-500 rounded-lg border-gray-200 border focus:outline-none focus:ring-1 transition ease-in-out duration-200 mt-5 mb-2 w-64 "></input> <br />
          <input required maxLength="27" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="password" className="px-2 py-2 ring-blue-500 rounded-lg border-gray-200 border focus:outline-none focus:ring-1 transition ease-in-out duration-200 my-2 w-64 "></input> <br />
          <motion.button disabled={sending} whileHover={!sending && {backgroundPosition: "right"}} type="submit" className="cursor-pointer disabled:cursor-not-allowed text-md text-gray-100 border-blue-500 font-semibold focus:outline-none w-64 px-2 py-2 my-2 rounded-lg shadow-md disabled:bg-gradient-to-r disabled:from-gray-400 disabled:to-gray-300" style={!sending && {backgroundImage: "linear-gradient(75deg, #3b82f6, #93c5fd,#93c5fd,#3b82f6", backgroundSize: "300%", backgroundPosition: "left", transition: "300ms background-position ease-in-out"}}>{sending ? <BeatLoader color="white" size={10}/> : <>log in</>}</motion.button> <br />
        </form>
        <p className="mt-2 text-gray-500">Need an account?</p> <p className="cursor-pointer text-lg text-gray-600 hover:text-gray-800 transition-colors ease-in-out duration-200 mb-5" onClick={() =>{ history.push('/signup'); setView('sign up')}}>sign up</p>
      </> : <>
        <form onSubmit={handleSignup}>
          <input required maxLength="27" value={username} onChange={(e) => setUsername(e.target.value)} type="text" placeholder="username" className="px-2 py-2 ring-blue-500 rounded-lg border-gray-200 border focus:outline-none focus:ring-1 transition ease-in-out duration-200 mt-5 mb-2 w-64 "></input> <br />
          <input required type="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} className="px-2 py-2 ring-blue-500 rounded-lg border-gray-200 border focus:outline-none focus:ring-1 transition ease-in-out duration-200 my-2 w-64 "></input> <br />
          <input required maxLength="27" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" className="px-2 py-2 ring-blue-500 rounded-lg border-gray-200 border focus:outline-none focus:ring-1 transition ease-in-out duration-200 my-2 w-64 "></input> <br />
          <motion.button disabled={sending} whileHover={!sending && {backgroundPosition: "right"}} type="submit" className="cursor-pointer disabled:cursor-not-allowed text-md text-gray-100 border-blue-500 font-semibold focus:outline-none w-64 px-2 py-2 my-2 rounded-lg shadow-md disabled:bg-gradient-to-r disabled:from-gray-400 disabled:to-gray-300" style={!sending && {backgroundImage: "linear-gradient(75deg, #3b82f6, #93c5fd,#93c5fd,#3b82f6", backgroundSize: "300%", backgroundPosition: "left", transition: "300ms background-position ease-in-out"}}>{sending ? <BeatLoader color="white" size={10}/> : <>sign up</>}</motion.button> <br />
        </form>
        <p className="mt-2 text-gray-500 text-md">Have an account?</p> <p className="cursor-pointer text-gray-600 text-lg hover:text-gray-800 transition-colors ease-in-out duration-200 mb-5" onClick={() => {history.push('/login'); setView('login')}}>log in</p>   
      </>}
      <div className="w-full text-center">
        <a className="text-gray-600 hover:text-gray-800 transition-colors ease-in-out duration-200 text-xl" href="/">home</a>
      </div>
      </div>
    </div>
  )
}
