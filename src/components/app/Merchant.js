import React from 'react'
import PropTypes from 'prop-types'

const Merchant = ({ record }) => <p>{record.name}</p>

Merchant.propTypes = {
  record: PropTypes.object,
}

export default Merchant
