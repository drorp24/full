import React from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Grid from '@material-ui/core/Grid'

const Try = () => (
  <Grid
    container
    direction="row"
    justify="center"
    alignItems="center"
    style={{ border: '1px solid blue', lineHeight: '0' }}
  >
    <LazyLoadImage
      effect="black-and-white"
      alt="dror"
      height="30"
      src="http://www.cryptocompare.com/media/19633/btc.png"
    />
  </Grid>
)

export default Try
