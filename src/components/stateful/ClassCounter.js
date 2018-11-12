import React, { Component } from 'react'

class ClassCounter extends Component {
  constructor(props) {
    super(props)
    this.state = {
      count: 0,
    }
  }

  render() {
    return (
      <div>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Class - {this.state.count} Clicks
        </button>
      </div>
    )
  }
}

export default ClassCounter
