import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { FixedSizeList } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import AutoSizer from 'react-virtualized-auto-sizer' //FixedSizeList needs explicit px measure, no '100%'/'100vh', so AutoSizer calculates it
import Loader from '../utility/Loader'

const useItemStyles = makeStyles({
  odd: {
    background: '#e6e6e0',
  },
  even: {},
})

const List = ({
  loading,
  fetchMore,
  entity,
  component,
  records,
  cursor,
  hasMore,
}) => {
  //
  const Item = ({ index, style }) => {
    const Component = component
    const record = isItemLoaded(index) ? records[index] : null
    const render = isItemLoaded(index) ? null : <Loader />
    const classes = useItemStyles()
    const { odd, even } = classes
    const className = index % 2 ? odd : even

    return <Component {...{ record, render, className, style }} />
  }

  // If there are more items to be loaded then add an extra item to hold a loading indicator.
  // Note: assigning itemsCount = records.length + 1 makes loadMoreItems's startIndex === stopIndex
  // however assigning some large value to itemCount will show a bunch of 'Loading...' records yielding an unfriendlly UI; One is better.
  const itemCount = hasMore ? records.length + 1 : records.length

  const isItemLoaded = index => !hasMore || index < records.length

  // InfiniteLoader may call loadMoreItems more than once with the same indexes if records aren't loaded yet
  // Passing an empty callback while still loading prevents duplicate calls
  const loadMoreItems = loading
    ? () => {}
    : (startIndex, stopIndex) =>
        fetchMore({
          variables: {
            pagination: {
              after: cursor,
              count:
                stopIndex - startIndex ||
                10 /* for the case where startIndex === stopIndex (see above) */,
              sortKey: '_id',
              sortOrder: 'ascending',
            },
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            const { cursor, hasMore } = fetchMoreResult[entity]
            const records = [
              ...prev[entity].records,
              ...fetchMoreResult[entity].records,
            ]

            return {
              [entity]: {
                cursor,
                hasMore,
                records,
                __typename: prev[entity].__typename,
              },
            }
          },
        })

  return (
    <InfiniteLoader
      itemCount={itemCount}
      isItemLoaded={isItemLoaded}
      loadMoreItems={loadMoreItems}
    >
      {({ onItemsRendered, ref }) => (
        <>
          {/* FixedSizeList expects explicit numeric sizes. AutoSizer provides them, but comes with 'height: 0' and 'width: 0' */}
          {/* 'display: contents' makes Page include 'FixedSizeList' in the flexbox rather than 'AutoSizer' */}
          <AutoSizer style={{ display: 'contents' }}>
            {({ height, width }) => {
              return (
                <FixedSizeList
                  itemCount={itemCount}
                  onItemsRendered={onItemsRendered}
                  ref={ref}
                  height={height}
                  width={width}
                  itemSize={height / 5}
                >
                  {Item}
                </FixedSizeList>
              )
            }}
          </AutoSizer>
        </>
      )}
    </InfiniteLoader>
  )
}

export default List
