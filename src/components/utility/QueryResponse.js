// A generic GraphQL response, yielding a Loader / a page with Messages / or a List
// ApolloClient Query 'loading' is actually ignored and empty 'data' is used instead because of the inifinite loading mechanism used
// Result handling (here) and list windowing and inifinite loading (handled by WiundowedList) are entirely generic
// The only non-generic thing is what component to render for every item, which is passed in the 'component' render prop
import React from 'react'
import { useSelector } from 'react-redux'
import Messages from '../utility/Messages'
import Loader from '../utility/Loader'
import WindowedList from '../list/WindowedList'
// import List from '../list/NonWindowedList' // The non react-window, .map solution, that eagerly renders and scrolls the entire page

// ! InfiniteLoader requires different 'loading' logic than Apollo's own 'loading' indicator
// When InfiniteLoader is used as in this case, the server is called *repeatedly* instead of just once
// making each such call return here, with 'loading' = true
// that 'loading' should not render anything or else whatever it renders will flush the UI.
// Instead, initial loading is identified by empty 'data' (rendering the animated <Loader /> in this case)
// (unlike 'loading', data would never be empty again in its next returns here, so it won't flush the already displayed records)
// whereas pagination 'Loading...' is identified on the record level (using InfiniteLoader's isItemLoaded) and displayed on the record level too
// (by defining InfiniteLoader's itemCount to the already fetched records length + 1 I made 'Loading...' show on one single record only, but that's entirely UI)
// Query's 'loading' itself is used to prevent InfiniteLoader's loadMoreItems from calling the same page more than once if that page is already loading
//
// ! Offline support requires different error/data handling
// When offline, 'data' may still come populated, due to Apollo's "cache-and-network" fetchPolicy.
// At the same time however 'error' would also come populated, since network is down.
// Regardless of offline, 'all' errorPolicy will make Apollo return *both* error and data for whatever reason,
// but it's really useful for offline situations, as Apollo can fetch from its own cache on some offline occasions.
// The above means that:
// - We should show data even if there's an error (adversely, not count on everything being ok if there's data)
// - UI-wise we should prepare to show an error alongside data (hence the new error prop of WindowedList)
// - If the error stems from being offline then we need to identify it ourselves (Apollo won't indicate that)
//   and modify the message accordingly so user becomes aware that the data may not be fresh.
//
// * Utilizing Apollo's cache
// While not much is required so that Apollo will try its cache first ("cache-and-network"), it won't survive a page refresh unless
// we use apollo-cache-persist, which does what its name implies.
const QueryResponse = ({
  loading,
  error,
  data,
  fetchMore,
  entity,
  component,
}) => {
  const online = useSelector(store => store.device.online)
  const userError = !online
    ? 'You are offline. Please refresh and try again'
    : error
    ? 'Our GraphQl server is temporarily down. Please refresh and try again'
    : null

  if (data && data[entity]) {
    const { records, cursor, hasMore } = data[entity]

    if (records.length) {
      return (
        <WindowedList
          {...{
            loading,
            fetchMore,
            entity,
            component,
            records,
            cursor,
            hasMore,
          }}
        />
      )
    } else {
      return (
        <Messages
          title="None found"
          array={['No merchants found for this criteria. Try modifying it']}
          kiy={null}
        />
      )
    }
  } else {
    if (error) {
      return (
        <Messages
          title={!online ? 'No Connection' : 'Error'}
          array={[userError]}
          kiy={!online ? null : error.graphQLErrors.length ? 'message' : null}
        />
      )
    } else {
      if (online) {
        return <Loader />
      } else {
        // don't show a loader while offline
        return <div />
      }
    }
  }
}

export default QueryResponse
