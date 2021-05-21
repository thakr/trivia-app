import React from 'react'
import {motion} from 'framer-motion'
import {useHistory} from 'react-router-dom'
import InfoCard from '../DashboardComponents/InfoCard'

export default function Home({user}) {
  const history = useHistory()
  return (
    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex flex-wrap items-center justify-center mt-10 w-10/12 max:w-7/12 max-h-screen">
      {user && <>
        <InfoCard header="elo:" data={user.elo} />
        <InfoCard header="matches played:" data={user.gamesPlayed} />
        <InfoCard header="wins:" data={user.wins} />
        <motion.div initial={{scale: 1}} whileHover={{scale: 1.05, backgroundPosition: "right"}} className="relative p-7 items-center rounded-xl shadow-2xl min-w-min w-4/6 h-64 m-5 max-w-lg" style={{backgroundImage: "linear-gradient(45deg, #60a5fa,#ef4444,#ef4444,#60a5fa", backgroundSize: "300%", backgroundPosition: "left", transition: "300ms background-position ease-in-out"}}>
          <h2 className="text-gray-100 font-semibold text-4xl">ranked queue:</h2>
          <span className="absolute right-7 bottom-7"><button onClick={() => history.push('/find-match')} className="text-md outline-none focus:outline-none bg-gray-800 border-gray-800 text-gray-100 font-semibold px-4 py-2 rounded-xl shadow-md cursor-pointer hover:bg-gray-100 hover:border-gray-100 hover:text-gray-800 border-4 transition:ease-in-out duration-200 h-14 w-30 text-xl">join</button></span>
        </motion.div>
        <motion.div initial={{scale: 1}} whileHover={{scale: 1.05, backgroundPosition: "right"}} className="relative p-7 items-center rounded-xl shadow-2xl min-w-min w-4/6 h-64 m-5 max-w-lg" style={{backgroundImage: "linear-gradient(45deg, #60a5fa,#ef4444,#ef4444,#60a5fa", backgroundSize: "300%", backgroundPosition: "left", transition: "300ms background-position ease-in-out"}}>
          <h2 className="text-gray-100 font-semibold text-4xl">unranked queue:</h2>
          <span className="absolute right-7 bottom-7"><button className="text-md outline-none focus:outline-none bg-gray-600 border-gray-600 text-gray-100 font-semibold px-4 py-2 rounded-xl shadow-md border-4 transition:ease-in-out duration-200 h-14 w-30 text-xl">coming soon</button></span>
        </motion.div>
      </>}
      
    </motion.div>
  )
}
