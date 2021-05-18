import React from 'react'

export default function Counter({amount}) {
  const items = []
  for (let i = 0; i < 10; i++) {
    if (i < amount) {
      items.push(<span className="h-5 w-5 rounded-full inline-block border-4 border-gray-100 bg-gray-100 shadow-lg mr-4 " />)
    } else {
      items.push(<span className="h-5 w-5 rounded-full inline-block border-4 border-gray-100 bg-transparent shadow-lg mr-4" />)
    }
  }
  return (
    <div className="absolute m-10 block sm:hidden">
      {items.map(v => {
        return v
      })}  
    </div>
  )
}
