import React from 'react'

export default function Timer({time}) {
  return (
    <div className="sm:static absolute mx-auto sm:mb-16 top-24 left-0 right-0 bottom-0 h-2">
      <h2 className="text-gray-100 font-semibold text-5xl">{time}</h2>
    </div>
   
  )
}
