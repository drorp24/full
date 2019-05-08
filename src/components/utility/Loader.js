import React from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'

const Loader = () => {
  return (
    <div style={{ height: '50%', width: '100%', textAlign: 'center' }}>
      <CircularProgress />
    </div>
  )
}

export default Loader
