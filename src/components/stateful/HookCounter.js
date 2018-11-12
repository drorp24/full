import React, { useState } from 'react'

export default function HookCounter() {
  const [count, setCount] = useState(0)
  return (
    <button onClick={() => setCount(count + 1)}>Hooks - {count} Clicks</button>
  )
}
