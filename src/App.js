import React from 'react'
import { Route, Link } from 'react-router-dom'
import Loadable from 'react-loadable'

const AsyncComponent = Loadable({
  loader: () =>
    import(/* webpackChunkName: "SomeComponent" */ './SomeComponent'),
  loading: () => <div>loading...</div>,
  modules: ['AsyncComponent'],
})

const AboutLink = Loadable({
  loader: () => import(/* webpackChunkName: "AboutLink" */ './AboutLink'),
  loading: () => <div>loading...</div>,
  modules: ['AboutLink'],
})

const App = () => (
  <div>
    <ul>
      <li>
        <Link to="/">Home</Link>
      </li>
      <AboutLink />
      <li>
        <Link to="/topics">Topics</Link>
      </li>
      <li>
        <Link to="/async">Async</Link>
      </li>
    </ul>

    <hr />

    <Route exact path="/" component={Home} />
    <Route path="/about" component={About} />
    <Route path="/topics" component={Topics} />
    <Route path="/async" component={AsyncComponent} />
  </div>
)

const Home = ({ staticContext }) => {
  if (staticContext) {
    console.log('Server rendering Home')
  }

  return (
    <div>
      <h2>Home</h2>
    </div>
  )
}

const About = () => (
  <div>
    <h2>About</h2>
  </div>
)

const Topics = ({ match, staticContext }) => {
  if (staticContext) {
    console.log('Server rendering Topics')
  }

  console.log('In Topics. match: ', match)

  return (
    <div>
      <h2>Topics</h2>
      <ul>
        <li>
          <Link to={`${match.url}/rendering`}>Rendering with React</Link>
        </li>
        <li>
          <Link to={`${match.url}/components`}>Components</Link>
        </li>
        <li>
          <Link to={`${match.url}/props-v-state`}>Props v. State</Link>
        </li>
      </ul>

      <Route path={`${match.url}/:topicId`} component={Topic} />
      <Route
        exact
        path={match.url}
        render={() => <h3>Please select a topic.</h3>}
      />
    </div>
  )
}

const Topic = ({ match }) => {
  console.log('In Topic. match: ', match)

  return (
    <div>
      <h3>{match.params.topicId}</h3>
    </div>
  )
}

export default App
