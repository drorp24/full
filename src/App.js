import React, { Component } from 'react'
import { Route, Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { setMessage, setCount } from './store/actions'
import HookCounter from './components/stateful/HookCounter'
import ClassCounter from './components/stateful/ClassCounter'
import ReduxCounter from './components/stateful/ReduxCounter'
import AsyncNotInitialRender from './components/async/notInitialRender/AsyncNotInitialRender'
import AsyncInitialRender from './components/async/initialRender/AsyncInitialRender'
import Home from './components/sync/Home'
import Topics from './components/sync/Topics'
import AsyncLazyComponent from './components/async/lazy/AsyncLazyComponent'
import Trading from './components/graphql/Trading'
import OneLevel from './components/graphql/OneLevel'
import ErrorBoundary from './components/error/boundary'
import TradingUpdated from './components/graphql/TradingUpdated'

class App extends Component {
  componentDidMount() {
    if (!this.props.message) {
      this.props.setMessage('Client')
    }
  }

  render() {
    return (
      <div>
        <h1>React {React.version}</h1>
        <h2>GraphQL</h2>
        <h3>Real-time Crypto rates:</h3>
        <TradingUpdated />
        <h3>Merchants Query:</h3>
        <ErrorBoundary>
          <OneLevel query="merchants" />
        </ErrorBoundary>
        <h3>Trading Query:</h3>
        <Trading />
        <h2>Redux</h2>
        <p>Redux initial data source: {this.props.message} </p>

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
        <Route exact path="/" component={Home} />
        <Route path="/topics" component={Topics} />
        <Route
          path="/asyncNotInitialRender"
          component={AsyncNotInitialRender}
        />
        <Route path="/asyncLazyComponent" component={AsyncLazyComponent} />
      </div>
    )
  }
}

// using mapDispatchToProps' short-hand version as it's so much clearer
// most use the long version for no reason, having to use a different prop name
export default withRouter(
  connect(
    ({ text: { message }, counter: { count } }) => ({
      message,
      count,
    }),
    {
      setMessage,
      setCount,
    }
  )(App)
)
