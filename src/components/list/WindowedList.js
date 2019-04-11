import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { FixedSizeList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer' //FixedSizeList needs explicit px measure, no '100%'/'100vh', so AutoSizer calculates it

const useRowStyles = makeStyles({
  odd: {
    background: '#e6e6e0',
  },
  even: {},
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
  // FixedSizeList must accept explicit numeric sizes, so AutoSizer must be used
  // AutoSizer comes with 'height: 0' and 'width: 0'
  // Being the Page's flexbox child (after AppBar), it ruins display
  // 'display: contents' makes FixedSizeList skip AutoSizer, treating flexbox's as its child instead
  return (
    <AutoSizer style={{ display: 'contents' }}>
      {({ height, width }) => {
        return (
          <FixedSizeList
            height={height}
            itemCount={records.length}
            itemSize={height / 5}
            width={width}
          >
            {Row}
          </FixedSizeList>
        )
      }}
    </AutoSizer>
  )
}

export default List
