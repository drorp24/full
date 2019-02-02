import React from 'react'
import Grid from '@material-ui/core/Grid'
import Page from '../themed/Page'
import { MyTypography } from '../themed/Box'
import { Typography } from '@material-ui/core'

const logErrorToMyService = (error, info) => {
  console.log('ErrorBoundary caught an error in a component')
  console.log('error: \n', error)
  console.log('info: \n', info)
}

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null, errorInfo: null }
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })
    // You can also log the error to an error reporting service
    logErrorToMyService(error, errorInfo)
  }

  render() {
    if (this.state.errorInfo) {
      return (
        <Page>
          <Grid
            container
            direction="column"
            justify="center"
            alignContent="center"
            alignItems="center"
            style={{ height: '50vh' }}
          >
            <Grid item>
              <Typography variant="h3" gutterBottom>
                Oops
              </Typography>
            </Grid>
            <Grid item>
              <MyTypography formVariant="header.title.typography" gutterBottom>
                Something went wrong
              </MyTypography>
            </Grid>
            <Grid item>
              <MyTypography
                formVariant="header.subtitle.typography"
                gutterBottom
              >
                <span style={{ display: 'block' }}>We've been notified.</span>
                <span style={{ display: 'block' }}>Do come back later.</span>
              </MyTypography>
              <div>
                <details style={{ whiteSpace: 'pre-wrap' }}>
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </details>
              </div>
            </Grid>
          </Grid>
        </Page>
      )
    }

    return this.props.children
  }
}
