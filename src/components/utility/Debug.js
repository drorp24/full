import React from 'react'

const displayObject = obj =>
  Object.entries(obj).map(([key1, value1]) =>
    typeof value1 === 'object' && value1 !== null ? (
      <div key={`div ${key1}`}>
        <p key={key1}>{key1}:</p>
        {Object.entries(value1).map(([key2, value2]) => (
          <p key={`${key1}  ${key2}`}>{`----${key2}: ${value2}`}</p>
        ))}
      </div>
    ) : (
      <p key={key1}>{`${key1}: ${value1}`}</p>
    )
  )

const Debug = props => props.objects.map(displayObject)

export default Debug
