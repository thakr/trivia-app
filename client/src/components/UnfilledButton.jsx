import React from 'react'

export default function FilledButton({txt, onClick,mr}) {
  return (
    <button onClick={onClick} className={`text-md outline-none focus:outline-none border-4 border-gray-500 text-gray-500 hover:text-gray-800 hover:border-gray-800 font-semibold px-4 py-2 rounded-xl shadow-md cursor-pointer transition:ease-in-out duration-200 h-14 w-30 text-xl mr-5`}>{txt}</button>
  )
}
