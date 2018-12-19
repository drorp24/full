// Multi-step form
// Using ESnext's class fields and arrow functions to avoid constructor & bindings

import React, { Component } from 'react'

export default class SearchForm extends Component {
  state = {
    step: 1,
    values: {
      currency: 'USD',
      amount: 1000,
      delivery: false,
    },
  }

  goToNext = e => {
    e.preventDefault()
    const { step } = this.state
    this.setState({ step: step + 1 })
    console.log('goToNext. state: ', this.state)
  }

  handleChange = e => {
    this.setState({
      values: { ...this.state.values, [e.target.name]: e.target.value },
    })
  }

  handleSubmit = e => {
    e.preventDefault()
    console.log('Submitting values. state: ', this.state)
  }

  render() {
    switch (this.state.step) {
      case 1:
        return (
          <ProductForm
            key="product"
            values={this.state.values}
            onChange={this.handleChange}
            onSubmit={this.goToNext}
          />
        )
      case 2:
        return (
          <DeliveryForm
            key="delivery"
            values={this.state.values}
            onChange={this.handleChange}
            onSubmit={this.handleSubmit}
          />
        )
      default:
        return <p>Unknown step number!</p>
    }
  }
}

class ProductForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.onSubmit}>
        <h3>What do you need</h3>
        <input
          name="currency"
          type="text"
          placeholder="Currency"
          value={this.props.values.currency}
          onChange={this.props.onChange}
        />
        <input
          name="amount"
          type="text"
          placeholder="Amount"
          value={this.props.values.amount}
          onChange={this.props.onChange}
        />

        <button>Next</button>
      </form>
    )
  }
}

class DeliveryForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.onSubmit}>
        <h3>How do you want it delivered</h3>
        <input
          name="delivery"
          type="text"
          placeholder="Delivery"
          value={this.props.values.delivery}
          onChange={this.props.onChange}
        />

        <button>Search</button>
      </form>
    )
  }
}
