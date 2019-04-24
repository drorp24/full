import React from 'react'
import PropTypes from 'prop-types'
import { Row } from '../themed/Box'

const Merchant = ({ record, render, className, style }) => (
  <Row justify="center" {...{ className, style }}>
    {render || record.name}
  </Row>
)

Merchant.propTypes = {
  record: PropTypes.object,
  content: PropTypes.string,
}

export default Merchant
