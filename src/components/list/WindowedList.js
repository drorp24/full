// An entirely generic windowed, and infinite loaded, list
// See comment on QueryResponse.js
import React from 'react'
import { useSelector } from 'react-redux'
import { FixedSizeList } from 'react-window'

import InfiniteLoader from 'react-window-infinite-loader'
import AutoSizer from 'react-virtualized-auto-sizer' //FixedSizeList needs explicit px measure, no '100%'/'100vh', so AutoSizer calculates it
import { makeStyles } from '@material-ui/styles'

const WindowedList = ({
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
    // That trick again to pass a component rather than a render prop/function
    const Component = component
    const itemLoaded = isItemLoaded(index)
    const loading = !itemLoaded
    const record = itemLoaded ? records[index] : null
    // const classes = useItemStyles()

    return <Component {...{ loading, record, index, style }} />
  }

  // If there are more items to be loaded then add an extra item to hold a loading indicator.
  // Note: assigning itemsCount = records.length + 1 makes loadMoreItems's startIndex === stopIndex
  // however assigning some large value to itemCount will show a bunch of 'Loading...' records yielding an unfriendlly UI; One is better.
  const itemCount = hasMore ? records.length + 1 : records.length

  const isItemLoaded = index => !hasMore || index < records.length

  // InfiniteLoader may call loadMoreItems more than once with the same indexes if records aren't loaded yet
  // Worse yet, these duplicate records get appended to the list
  // Passing an empty callback while still loading prevents duplicate calls / duplicate entries
  // loadMoreItems simply invokes ApolloClient Query's 'fetchMore' to call for the next page and append the fetched new records
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

  // const listRef = useRef()

  const useStyles = makeStyles(theme => ({
    list: {
      backgroundColor: theme.palette.background.extra,
    },
  }))

  const classes = useStyles()

  const layout = useSelector(store => store.app.layout)

  return (
    <InfiniteLoader
      itemCount={itemCount}
      isItemLoaded={isItemLoaded}
      loadMoreItems={loadMoreItems}
      threshold={1} // value of s1 will make 'loading...' appear thus checking inifite loading works ok. Should be removed eventually.
    >
      {({ onItemsRendered, ref }) => (
        <>
          {/* No clue what onItemsRendered, ref are and no documentation. FixedSizeList has similar props: https://react-window.now.sh/#/api/FixedSizeList  */}
          {/* FixedSizeList expects explicit numeric sizes. AutoSizer provides them, but comes with 'height: 0' and 'width: 0' */}
          {/* To fix this 'display: contents' makes Page include its child 'FixedSizeList' in the flexbox rather than 'AutoSizer' itself */}
          <AutoSizer style={{ display: 'contents' }}>
            {({ height, width }) => {
              console.log('height, width: ', height, width)
              return (
                <FixedSizeList
                  itemCount={itemCount}
                  onItemsRendered={onItemsRendered}
                  // ref={listRef}
                  height={height}
                  width={width}
                  itemSize={height / 1.8}
                  className={classes.list}
                  layout={layout}
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

export default WindowedList
