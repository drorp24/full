import React from 'react'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Divider from '@material-ui/core/Divider'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import { makeStyles, mergeClasses } from '@material-ui/styles'
import Loader from '../utility/Loader'
import { Column } from '../themed/Box'

const listPadding = '16px'
const avatarWidth = 12
const avatarMargin = 3

// makeStyles accepts a 'theme' argument and returns another function that optionally accepts the component's props (or anything really)
// this is by far the best way to define styling rules in a dynamic way, i.e., as a function of some changing props (Requires MUI v4)
const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  inline: {
    display: 'inline',
  },
  listItemAvatar: {
    alignSelf: 'center',
  },
  listItem: {
    alignItems: props => (props.loading ? 'center' : 'flex-start'),
  },
  avatar: {
    borderRadius: 'unset',
    width: `${avatarWidth}vmax`,
    height: `${avatarWidth}vmax`,
    marginRight: `${avatarMargin}vmax`,
  },
  dividerInset: {
    marginLeft: `calc(${listPadding} + ${avatarWidth + avatarMargin}vmax)`,
  },
}))

const Merchant = ({ loading, record, className, style }) => {
  const classes = useStyles({ loading })

  return (
    <List className={classes.root}>
      <ListItem className={classes.listItem}>
        <ListItemAvatar className={classes.listItemAvatar}>
          <>
            {loading && (
              <Avatar className={classes.avatar}>
                <Loader />
              </Avatar>
            )}
            {!loading && (
              <Avatar
                className={classes.avatar}
                alt="Remy Sharp"
                src="https://material-ui.com/static/images/avatar/1.jpg"
              />
            )}
          </>
        </ListItemAvatar>
        {loading && (
          <Column>
            <div>Loading...</div>
          </Column>
        )}
        {!loading && (
          <ListItemText
            primary={<Typography>{record.name}</Typography>}
            secondary={
              <Typography
                component="span"
                variant="body2"
                className={classes.inline}
                color="textPrimary"
              >
                {record.address}
              </Typography>
            }
          />
        )}
      </ListItem>
      <Divider
        variant="inset"
        component="li"
        className={classes.dividerInset}
      />
    </List>
  )
}

export default Merchant

// const Merchant = ({ record, render, className, style }) => (
//   <Row justify="center" {...{ className, style }}>
//     {render || record.name}
//   </Row>
// )

// Merchant.propTypes = {
//   record: PropTypes.object,
//   content: PropTypes.string,
// }

// export default Merchant
