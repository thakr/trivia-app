import React from 'react'
import {motion} from 'framer-motion'
import {useHistory} from 'react-router-dom'
import FilledButton from '../FilledButton'
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
          <h2 className="text-gray-200 font-semibold text-4xl">ranked queue:</h2>
          <span className="absolute right-7 bottom-7"><FilledButton onClick={() => history.push('/find-match')} txt="join"/></span>
        </motion.div>
        <motion.div initial={{scale: 1}} whileHover={{scale: 1.05, backgroundPosition: "right"}} className="relative p-7 items-center rounded-xl shadow-2xl min-w-min w-4/6 h-64 m-5 max-w-lg" style={{backgroundImage: "linear-gradient(45deg, #60a5fa,#ef4444,#ef4444,#60a5fa", backgroundSize: "300%", backgroundPosition: "left", transition: "300ms background-position ease-in-out"}}>
          <h2 className="text-gray-200 font-semibold text-4xl">unranked queue:</h2>
          <span className="absolute right-7 bottom-7"><FilledButton txt="coming soon"/></span>
        </motion.div>
      </>}
      
    </motion.div>
  )
}
