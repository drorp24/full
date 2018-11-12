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

class App extends Component {
  componentDidMount() {
    if (!this.props.message) {
      this.props.setMessage('Client')
    }
  }

  render() {
    return (
      <div>
        <p>React {React.version}</p>
        <p>Redux initial data source: {this.props.message} </p>
        <AsyncInitialRender />

        <p>Stateful Components</p>
        <HookCounter />
        <ClassCounter />
        <ReduxCounter />

        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/topics">Topics</Link>
          </li>
          <li>
            <Link to="/asyncNotInitialRender">
              Click for async component that was not included in initial render
            </Link>
          </li>
        </ul>

        <hr />

        <Route exact path="/" component={Home} />
        <Route path="/topics" component={Topics} />
        <Route
          path="/asyncNotInitialRender"
          component={AsyncNotInitialRender}
        />
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
