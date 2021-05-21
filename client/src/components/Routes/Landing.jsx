import bg from '../../img/bg.svg'
import {motion} from 'framer-motion'
import {useHistory} from 'react-router-dom'
import FilledButton from '../FilledButton'
import UnfilledButton from '../UnfilledButton'

export default function Landing() {
  let history = useHistory()
  return (   
    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex flex-col justify-center items-center min-h-screen" style={{backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: '50% 50%'}}>
      <motion.div className="flex items-center text-center sm:flex-col" initial={{opacity: 0}} animate={{opacity: 1}}>
        <h1 className="font-bold text-7xl">trivia<span className="text-blue-700">hit</span></h1>
        <div className="ml-24 sm:ml-0 sm:mt-5 outline-none">
          <UnfilledButton txt={localStorage.getItem("token") ? "leaderboard" : "log in"} onClick={()=> {
            localStorage.getItem("token") ? console.log('leaderboard') : history.push('/login')
          }}/>
          <FilledButton txt={localStorage.getItem("token") ? "dashboard" : "sign up"} onClick={() => {
            localStorage.getItem("token") ? history.push('/dashboard') : history.push('/signup')
          }} />
        </div>
        </motion.div>
        <motion.p className="mt-10 text-center mx-4 text-gray-700" initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration:0.5}}>triviahit is an online multiplayer trivia game where players answer a series of 10 questions and compete to get the best score and raise in rank.</motion.p>
        <motion.p className="mt-5 text-center mx-4 text-gray-700" initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration:0.5}}>This is an open source project created by Shaan Thakker. View the source code on <a className="underline" target="_blank" rel="noreferrer" href='https://github.com/demolite-stm/trivia-app'>GitHub</a>.</motion.p>
      </motion.div>
  )
}
