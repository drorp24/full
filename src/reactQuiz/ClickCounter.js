import React, { useState } from 'react'

const ClickCounter = () => {
  const [counter, setCounter] = useState(0)
  const incrementCounter = () => setCounter(counter + 1)

  return (
    <button
      onClick={incrementCounter}
      style={{
        fontSize: '1.5rem',
        padding: '1.5rem',
        borderRadius: '4px',
      }}
    >
      Clicked: {counter}
    </button>
  )
}

export default ClickCounter
