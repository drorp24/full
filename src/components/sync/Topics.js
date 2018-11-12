import React from 'react'
import { Route, Link } from 'react-router-dom'

const Topics = ({ match, staticContext }) => {
  if (staticContext) {
    console.log('Server rendering Topics')
  }

  console.log('In Topics. match: ', match)

  return (
    <div>
      <p>Topics</p>
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
        render={() => <p>Please select a topic.</p>}
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

export default Topics
