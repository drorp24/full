import React from 'react'

const Home = ({ staticContext }) => {
  if (staticContext) {
    console.log('Server rendering Home')
  }

  return (
    <div>
      <h2>Home</h2>
    </div>
  )
}

export default Home
