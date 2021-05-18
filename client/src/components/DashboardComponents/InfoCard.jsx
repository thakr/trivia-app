import React from 'react'

export default function InfoCard({header,data}) {
  return (
    <div className="bg-white px-5 py-2.5 items-center rounded-xl shadow-md w-80 h-20 m-5">
      <h2 className="text-gray-600 font-semibold text-xl">{header}</h2>
      <p className="text-gray-900 font-bold text-2xl">{data}</p>
    </div>
  )
}
