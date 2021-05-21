import React, { useState,useEffect } from 'react'
import {motion} from 'framer-motion'
import Home from '../DashboardComponents/Home'
import {useHistory} from 'react-router-dom'
import BeatLoader from "react-spinners/BeatLoader"
import Shop from '../DashboardComponents/Shop'
const axios = require('axios')

export default function Dashboard() {
  const history = useHistory()
  useEffect(() => {
    axios.get(process.env.NODE_ENV === 'development' ? `http://localhost:8080/api/userinfo?token=${localStorage.getItem('token')}` : `/api/userinfo?token=${localStorage.getItem('token')}`)
    .then(res => {
      if (res.data.error && res.data.msg) history.push({pathname: '/login', defaultMsg: res.data.msg})
      setUser(res.data.user)
      if (res.data.newToken) localStorage.setItem("token", res.data.newToken)
      setView(<Home user={res.data.user} />)
      setHomeColor("3b82f6")
    })
    //eslint-disable-next-line
  }, [])
  const [user, setUser] = useState()
  const [view, setView] = useState()
  const [homeColor, setHomeColor] = useState("000000")
  const [shopColor, setShopColor] = useState("000000")


  return (
    <div className="flex h-screen w-screen bg-gradient-to-r from-blue-500 to-gray-100 items-center justify-center overflow-auto">
      <motion.div initial={{x:-100}} animate={{x:0}} className="absolute left-5 bg-white bg-opacity-90 p-5 rounded-xl shadow-lg text-center z-10">
        <div><motion.button initial={{y:0}} whileHover={{y:-10}} className="focus:outline-none" onClick={() => {
          setView(<Home user={user} />)
          setHomeColor("3b82f6")
          setShopColor("000000")
        }}><img src={`https://img.icons8.com/small/32/${homeColor}/home.png`} className="my-2" alt="home"/></motion.button></div>
        <div><motion.button initial={{y:0}} whileHover={{y:-10}} className="focus:outline-none" onClick={() => {
          setView(<Shop user={user} />)
          setShopColor("3b82f6")
          setHomeColor("000000")
        }}><img src={`https://img.icons8.com/small/32/${shopColor}/shopping-bag.png`} className="my-2" alt="shop" /></motion.button></div>
        <div><motion.button initial={{y:0}} whileHover={{y:-10}} className="focus:outline-none" onClick={() => {
          localStorage.removeItem("token")
          window.open('/', '_self')
        }}><img src="https://img.icons8.com/small/32/000000/exit.png" alt="log out" className="my-2"/></motion.button></div>
      </motion.div>
      {view ? view : <BeatLoader color="white" />}
    </div>
  )
}
