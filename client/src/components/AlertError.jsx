import React from 'react'

export default function AlertError({msg, removeAlert}) {
  return (
    <div className="flex justify-between bg-red-500 bg-opacity-40 p-2 rounded-lg items-center px-5 my-2 w-64 overflow-x-hidden">
      <p className="text-red-800">{msg}</p>
      <svg onClick={removeAlert} className="w-5 h-5 ml-10 fill-current text-red-800 cursor-pointer" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
        <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
      </svg>
    </div>
  )
}
