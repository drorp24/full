import React from 'react'

import ListItem from '@material-ui/core/ListItem'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/styles'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'

import Loader from '../utility/Loader'
import { ellipsis, ellipsisContainer } from '../themed/Box'

// makeStyles accepts a 'theme' argument and returns another function that optionally accepts the component's props (or anything really)
// this is by far the best way to define styling rules in a dynamic way, i.e., as a function of some changing props (Requires MUI v4)
const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    // Mui's Grid sets wrap by default, which forces items otherwised lined up to spread across multiple lines
    flexWrap: 'nowrap',
    height: '100%',
    padding: theme.spacing(2),
  },
  imgContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    maxWidth: '100%',
    maxHeight: '16vh', // in sync with FixedSizeList's itemSize
    width: '100vw',
    borderRadius: '5px',
  },
  price: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quote: {
    marginRight: theme.spacing(2),
  },
  detailsContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  divider: {
    height: '2px',
  },
}))

// ! Being a child of FixedSizeList, the height of this component is fixed as determined by FixedSizeList's itemSize prop

const Content = ({ loading, record }) => {
  const classes = useStyles({ loading })
  return (
    <Grid container className={classes.root} spacing={2} direction="column">
      <Grid item className={classes.imgContainer}>
        <div className={classes.img}>
          <img
            className={classes.img}
            alt="complex"
            src="https://material-ui.com/static/images/grid/complex.jpg"
          />
        </div>
      </Grid>
      <Grid item className={classes.detailsContainer}>
        <div className={classes.details} style={{ ...ellipsisContainer }}>
          <Typography style={{ ...ellipsis }}>{record.name}</Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            style={{ ...ellipsis }}
          >
            {record.address
              ? record.address.replace(', Israel', '').replace(', israel', '')
              : ''}
          </Typography>
        </div>
      </Grid>
      <Grid item className={classes.price}>
        <Typography variant="body2" className={classes.quote}>
          {Number(
            record && record.quote && record.quote.price
              ? record.quote.price.toFixed(2)
              : 0
          ).toLocaleString(undefined, {
            style: 'currency',
            currency: record.quote.quote,
          })}
        </Typography>
      </Grid>
      <Divider className={classes.divider} />
    </Grid>
  )
}

const Merchant = ({ loading, record, style }) => {
  const classes = useStyles({ loading })
  return (
    <>
      <ListItem
        className={classes.listItem}
        style={style}
        disableGutters={true}
      >
        {loading && <Loader />}
        {!loading && <Content {...{ loading, record }} />}
      </ListItem>
    </>
  )
}

export default Merchant
