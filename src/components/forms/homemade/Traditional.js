// Multi-step form
// Traditional: classes, constructors & binding

import React, { Component } from 'react'

export default class SearchForm extends Component {
  constructor() {
    super()
    this.state = {
      step: 1,
      values: {
        currency: 'USD',
        amount: 1000,
        delivery: false,
      },
    }
    this.goToNext = this.goToNext.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  goToNext(e) {
    e.preventDefault()
    const { step } = this.state
    this.setState({ step: step + 1 })
    console.log('goToNext. state: ', this.state)
  }

  handleChange(e) {
    this.setState({
      // setState will see that state's other level-1 keys remain intact ('step' in this case)
      // but it won't cater for the deeper objects ('values' in this case)
      // the 'values' spread and the [name] key override will make values intact with only [name] value changed.
      // cases where level is unknown or merge is needed require lodash or reselect.
      values: { ...this.state.values, [e.target.name]: e.target.value },
    })
  }

  handleSubmit(e) {
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
