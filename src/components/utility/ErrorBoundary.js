import React from 'react'
import { PropTypes } from 'prop-types'

import { TextField } from '@material-ui/core'
import Page from '../page/Page'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('error, errorInfo: ', error, errorInfo)
  }

  render() {
    const { value, online } = this.props
    if (!value && this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.level === 'line' ? (
        <TextField
          error
          fullWidth
          helperText={
            online
              ? 'Something went wrong'
              : 'We do need Internet connection to show this'
          }
        ></TextField>
      ) : (
        <Page title="Something went wrong">
          <div
            style={{
              height: '50%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <h3>Oops, something went wrong...</h3>
            <p>We've been notified and taking care of this</p>
          </div>
        </Page>
      )
    }

    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  level: PropTypes.oneOf(['line', 'page']).isRequired,
}

export default ErrorBoundary
