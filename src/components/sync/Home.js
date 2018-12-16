import React from 'react'
import { Link } from 'react-router-dom'

import HookCounter from '../stateful/HookCounter'
import ClassCounter from '../stateful/ClassCounter'
import ReduxCounter from '../stateful/ReduxCounter'
import AsyncInitialRender from '../async/initialRender/AsyncInitialRender'

const Home = ({ staticContext }) => {
  if (staticContext) {
    console.log('Server rendering Home')
  }

  return (
    <div>
      <h1>React {React.version}</h1>
      <h2>WebSocket</h2>
      <p>
        <Link to="/cryptochart">Crypto Chart</Link>
      </p>

      {/* <p>
        <Link to="/cryptochartUsingHooks">Crypto Chart Using Hooks</Link>
      </p> */}

      <h2>GraphQL</h2>
      <h3>Subscription</h3>
      <p>
        <Link to="/realtimetrading">Real-time Trading</Link>
      </p>
      <h3>Query</h3>
      <p>
        <Link to="/merchants">Merchants</Link>
      </p>
      <p>
        <Link to="/trading">Trading</Link>
      </p>
      <h2>Stateful Components</h2>
      <HookCounter />
      <ClassCounter />
      <ReduxCounter />
      <h2>Async Components</h2>
      <h3>Included in initial render</h3>
      <AsyncInitialRender />
      <h3>Not included in initial render</h3>
      <ul>
        <li>
          <Link to="/asyncNotInitialRender">react-loadable</Link>
        </li>
        <li>
          <Link to="/asyncLazyComponent">react lazy</Link>
        </li>
      </ul>
      <h2>Routing</h2>
      <ul>
        <li>
          <Link to="/">Simple</Link>
        </li>
        <li>
          <Link to="/topics">Nested</Link>
        </li>
      </ul>
      <hr />
    </div>
  )
}

export default Home
