import React from 'react'

export default function FilledButton({txt, onClick}) {
  return (
    <button onClick={onClick} className="text-md outline-none focus:outline-none bg-gray-800 border-gray-800 text-white font-semibold px-4 py-2 rounded-xl shadow-md cursor-pointer hover:bg-transparent hover:text-gray-800 border-4 transition:ease-in-out duration-200 h-14 w-30 text-xl">{txt}</button>
  )
}
