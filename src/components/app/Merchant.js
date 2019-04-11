import React from 'react'
import PropTypes from 'prop-types'
import { Row } from '../themed/Box'

const Merchant = ({ record, className, style }) => (
  <Row justify="center" {...{ className, style }}>
    {record.name}
  </Row>
)

Merchant.propTypes = {
  record: PropTypes.object,
}

export default Merchant
