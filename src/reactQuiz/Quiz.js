import React from 'react'
import ClickCounter from './ClickCounter'

const QuizLine = ({ children }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      minHeight: '15vh',
      padding: '20px',
      textAlign: 'center',
      fontSize: '1.5rem',
    }}
  >
    {children}
  </div>
)

const Quiz = () => (
  <QuizLine>
    <ClickCounter />
  </QuizLine>
)

export default Quiz
