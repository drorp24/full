import React from 'react'

const Home = ({ staticContext }) => {
  if (staticContext) {
    console.log('Server rendering Home')
  }

  return (
    <div>
      <p>Home</p>
    </div>
  )
}

export default Home
