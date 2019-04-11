import React from 'react'
import { makeStyles } from '@material-ui/styles'

const useRowStyles = makeStyles({
  odd: {
    minHeight: '100px',
    background: '#e6e6e0',
  },
  even: {
    minHeight: '100px',
  },
})

const List = ({ fetchMore, entity, component, records, cursor, hasMore }) => {
  //
  const Row = ({ index, style }) => {
    const Component = component
    const classes = useRowStyles()
    const { odd, even } = classes
    return (
      <Component
        record={records[index]}
        className={index % 2 ? odd : even}
        style={style}
      />
    )
  }

  return (
    <>
      {records.map((record, index) => (
        <Row index={index} key={record.id} />
      ))}
    </>
  )
}

export default List
