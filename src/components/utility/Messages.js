import React from 'react'
import { Column } from '../themed/Box'

const Messages = ({ title, array, kiy }) => {
  console.log('title, array, kiy : ', title, array, kiy)
  return (
    <Column style={{ height: '80%', justifyContent: 'flex-start' }}>
      <h3 style={{ marginBottom: '2em' }}>{title}</h3>
      {array.map((item, i) => {
        const message = kiy ? item[kiy] : item
        console.log('message: ', message)
        return <p key={i}>{message}</p>
      })}
    </Column>
  )
}

export default Messages
