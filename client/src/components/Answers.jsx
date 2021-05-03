import React from 'react'
const normalButton = "focus:outline-none rounded-lg min-w-max bg-red-400 text-white font-medium shadow-lg p-4 my-4 mx-2"
const correctButton = "focus:outline-none rounded-lg bg-green-400 text-white font-medium shadow-lg p-4 my-4 mx-2"
const wrongButton = "focus:outline-none rounded-lg bg-red-600 text-white font-medium shadow-lg p-4 my-4 mx-2"

export default function Question({handleAnswer, answers, question, finished, picked}) {
  return (
    <div className="min-w-full flex content-center flex-col mt-2">
      <div className="flex justify-center min-w-10 sm:flex-col">
        <button onClick={() => handleAnswer(answers[0], question.correct_answer)} className={finished && answers[0] === question.correct_answer ? correctButton : picked === answers[0] ? wrongButton : normalButton} dangerouslySetInnerHTML={ {__html: answers[0]} }></button>
        <button onClick={() => handleAnswer(answers[1], question.correct_answer)} className={finished && answers[1] === question.correct_answer ? correctButton : picked === answers[1] ? wrongButton : normalButton} dangerouslySetInnerHTML={ {__html: answers[1]} }></button>
      </div>
      {answers.length > 2 && 
      <>
      <div className="flex justify-center min-w-10 sm:flex-col mx-2">
        <button onClick={() => handleAnswer(answers[2], question.correct_answer)} className={finished && answers[2] === question.correct_answer ? correctButton : picked === answers[2] ? wrongButton : normalButton} dangerouslySetInnerHTML={ {__html: answers[2]} }></button>
        <button onClick={() => handleAnswer(answers[3], question.correct_answer)} className={finished && answers[3] === question.correct_answer ? correctButton : picked === answers[3] ? wrongButton : normalButton} dangerouslySetInnerHTML={ {__html: answers[3]} }></button>
      </div>
      </> }
      
    </div>
  )
}
