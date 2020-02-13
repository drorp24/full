import React from 'react'
import { Column } from '../themed/Box'
import { makeStyles } from '@material-ui/styles'

const Messages = ({ title, array, kiy }) => {
  console.log('title, array, kiy : ', title, array, kiy)
  const useStyles = makeStyles(theme => ({
    main: {
      height: '80%',
      padding: '2em',
      justifyContent: 'flex-start',
    },
    title: {
      marginBottom: '2em',
    },
    text: {
      fontSize: '1.1em',
    },
  }))
  const classes = useStyles()
  return (
    <Column className={classes.main}>
      <h3 className={classes.title}>{title}</h3>
      {array.map((item, i) => {
        const message = kiy ? item[kiy] : item
        console.log('message: ', message)
        return (
          <p clssName={classes.text} key={i}>
            {message}
          </p>
        )
      })}
    </Column>
  )
}

export default Messages
