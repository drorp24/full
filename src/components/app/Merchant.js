import React from 'react'

import ListItem from '@material-ui/core/ListItem'
import Typography from '@material-ui/core/Typography'
import { makeStyles, ThemeProvider } from '@material-ui/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'

import Loader from '../utility/Loader'
import { ellipsis, ellipsisContainer } from '../themed/Box'

// makeStyles accepts a 'theme' argument and returns another function that optionally accepts the component's props (or anything really)
// this is by far the best way to define styling rules in a dynamic way, i.e., as a function of some changing props (Requires MUI v4)
const useStyles = makeStyles(theme => ({
  card: {
    width: '100%',
  },
  media: {
    height: 140,
  },
  listItem: {
    justifyContent: 'center',
    padding: theme.spacing(2),
  },
  price: {
    fontWeight: '400',
  },
}))

// ! Being a child of FixedSizeList, the height of this component is fixed as determined by FixedSizeList's itemSize prop

const Content = ({ record }) => {
  const classes = useStyles()
  const imgUri = `https://maps.googleapis.com/maps/api/streetview?size=400x400&location=${
    record.location.coordinates[1]
  },${record.location.coordinates[0]}&fov=90&key=${
    process.env.REACT_APP_GOOGLE_API_KEY
  }`

  return (
    <Card className={classes.card}>
      <CardActionArea>
        <CardMedia
          className={classes.media}
          image={imgUri}
          title="Contemplative Reptile"
        />
        <CardContent>
          <Typography
            style={{ ...ellipsis }}
            gutterBottom
            variant="h5"
            component="h2"
          >
            {record.name}
          </Typography>
          <Typography
            style={{ ...ellipsis }}
            variant="body2"
            color="textSecondary"
            component="p"
            gutterBottom
          >
            {record.address || 'No address recorded'}
          </Typography>
          <Typography variant="h6" className={classes.price}>
            {Number(
              record && record.quote && record.quote.price
                ? record.quote.price.toFixed(2)
                : 0
            ).toLocaleString(undefined, {
              style: 'currency',
              currency: record.quote.quote,
            })}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button size="small" color="primary">
          Order
        </Button>
        <Button size="small" color="primary">
          Learn More
        </Button>
      </CardActions>
    </Card>
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
        {!loading && <Content {...{ record }} />}
      </ListItem>
    </>
  )
}

export default Merchant
