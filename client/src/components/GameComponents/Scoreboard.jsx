import React from 'react'

export default function Scoreboard({ users }) {
  return (
      <div className="absolute sm:relative h-2 bottom-16 sm:bottom-0 sm:mt-32 sm:flex sm:min-w-full items-center text-center justify-center">
          <div className="flex flex-row sm:flex-col sm:min-w-full sm:bg-gray-900">
            {users.map(v => {
              return (
                <div className="bg-black py-2 px-4 rounded-lg mx-4 sm:mb-4" style={{filter: "drop-shadow(5px 5px 4px #0a0a0a"}}>
                  <p className="text-gray-100"><span className="font-semibold">{v.username}: </span>{v.points}</p>
                </div>
              )
            })}
            
          </div>
      </div>
  )
}
