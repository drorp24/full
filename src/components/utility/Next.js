import React from 'react'
import Page from '../page/Page'
import { connect } from 'react-redux'
import { setSearch } from '../../redux/actions'

const Next = props => {
  console.log('props: ', props)
  return (
    <Page>
      <h3>Next page</h3>
    </Page>
  )
}

export default connect(
  ({ search }) => ({ search }),
  { setSearch }
)(Next)
