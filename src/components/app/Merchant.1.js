import React from 'react'

import ListItem from '@material-ui/core/ListItem'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/styles'
import Grid from '@material-ui/core/Grid'

import Loader from '../utility/Loader'
import { ellipsis, ellipsisContainer } from '../themed/Box'

const listPadding = '16px'
const avatarWidth = 12
const avatarMargin = 3
const dividerColor = '#ddd'

// makeStyles accepts a 'theme' argument and returns another function that optionally accepts the component's props (or anything really)
// this is by far the best way to define styling rules in a dynamic way, i.e., as a function of some changing props (Requires MUI v4)
const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    // Mui's Grid sets wrap by default, which forces items otherwised lined up to spread across multiple lines
    flexWrap: 'nowrap',
    height: '100%',
  },
  imgContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    maxWidth: '100%',
    maxHeight: '10vmax',
  },
  price: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    textAlign: 'right',
    borderBottom: '1px solid',
    borderBottomColor: dividerColor,
  },
  quote: {
    marginRight: theme.spacing(2),
  },
  detailsContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderBottom: '1px solid',
    borderBottomColor: dividerColor,
  },
  details: {},
  item: {},
  paper: {
    padding: theme.spacing(2),
    margin: 'auto',
    maxWidth: 500,
  },
}))

const Content = ({ loading, record }) => {
  const classes = useStyles({ loading })
  return (
    <Grid container className={classes.root} spacing={2}>
      <Grid item xs={4} className={classes.imgContainer}>
        <div className={classes.img}>
          <img
            className={classes.img}
            alt="complex"
            src="https://material-ui.com/static/images/grid/complex.jpg"
          />
        </div>
      </Grid>
      <Grid item xs={6} className={classes.detailsContainer}>
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
      <Grid item xs={2} className={classes.price}>
        <Typography variant="body2" className={classes.quote}>
          {Number(record.quote.price.toFixed(2)).toLocaleString(undefined, {
            style: 'currency',
            currency: record.quote.quote,
          })}
        </Typography>
      </Grid>
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
