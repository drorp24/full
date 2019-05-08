// An entirely generic windowed, and infinite loaded, list
// See comment on QueryResponse.js
import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { FixedSizeList } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import AutoSizer from 'react-virtualized-auto-sizer' //FixedSizeList needs explicit px measure, no '100%'/'100vh', so AutoSizer calculates it

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
    // That trick again to pass a component rather than a render prop/function
    const Component = component
    const itemLoaded = isItemLoaded(index)
    const loading = !itemLoaded
    const record = itemLoaded ? records[index] : null
    const classes = useItemStyles()
    const { odd, even } = classes
    const className = index % 2 ? odd : even

    return <Component {...{ loading, record, className, style }} />
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

  return (
    <InfiniteLoader
      itemCount={itemCount}
      isItemLoaded={isItemLoaded}
      loadMoreItems={loadMoreItems}
    >
      {({ onItemsRendered, ref }) => (
        <>
          {/* No clue what onItemsRendered, ref are and no documentation  */}
          {/* FixedSizeList expects explicit numeric sizes. AutoSizer provides them, but comes with 'height: 0' and 'width: 0' */}
          {/* To fix this 'display: contents' makes Page include its child 'FixedSizeList' in the flexbox rather than 'AutoSizer' itself */}
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
