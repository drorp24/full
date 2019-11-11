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
    const online = this.props.online
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.level === 'line' ? (
        <TextField
          error
          fullWidth
          helperText={
            online
              ? 'Something went wrong'
              : "Can't show, Internet connection seems to be lost"
          }
        ></TextField>
      ) : (
        <Page title="Something went wrong">
          <div style={{ height: '50%' }}>
            We've been notified and taking care of this
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
