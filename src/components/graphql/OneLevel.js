// Generified*, one-level graphql query display (* = unaware of the query)
// To do it properly I should have used recursion
// both react-loader and the newer React.lazy won't work as they only return components, not arbitrary files
// arbitray files require using webpack's dynamic import()
import React from 'react'
import { Query } from 'react-apollo'

export default class OneLevel extends React.Component {
  constructor(props) {
    super(props)
    this.state = { gqlquery: {} }
  }

  async componentDidMount() {
    const fetchedQuery = await import(`../../queries/${this.props.query}`)
    this.setState({ gqlquery: fetchedQuery.default })
  }

  render() {
    // couldn't find a shorter way to express empty state
    // usually such protection is not required; it would simply display Loading
    // in this case though, react throws the entire app if Query's query arg is not a valid query
    if (!Object.keys(this.state.gqlquery).length) return <p>Loading...</p>
    return (
      <Query query={this.state.gqlquery}>
        {({ loading, error, data }) => {
          if (loading) return <p>Loading...</p>
          if (error) return <p>Error :(</p>

          return data[Object.keys(data)[0]].map(item => (
            <div key={item[Object.keys(item)[0]]}>
              <h4>{item[Object.keys(item)[0]]}</h4>
              {Object.entries(item).map(
                ([key, value]) =>
                  key !== '__typename' && (
                    <p key={key}>
                      {key}: {value}
                    </p>
                  )
              )}
            </div>
          ))
        }}
      </Query>
    )
  }
}
