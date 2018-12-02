// Self excercise of using hooks!
import React, { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Chart from '../utility/Chart'

const styles = theme => ({
  'chart-container': {
    height: 400,
  },
})

const CryptoChartUsingHooks = props => {
  const [initialized, setInitialized] = useState(false)
  const [lineChartData, setLineChartData] = useState({
    labels: [],
    datasets: [
      {
        type: 'line',
        label: 'BTC-USD',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderColor: props.theme.palette.primary.main,
        pointBackgroundColor: props.theme.palette.secondary.main,
        pointBorderColor: props.theme.palette.secondary.main,
        borderWidth: '2',
        lineTension: 0.45,
        data: [],
      },
    ],
  })

  const [lineChartOptions] = useState({
    responsive: true,
    maintainAspectRatio: false,
    tooltips: {
      enabled: true,
    },
    scales: {
      xAxes: [
        {
          ticks: {
            autoSkip: true,
            maxTicksLimit: 10,
          },
        },
      ],
    },
  })

  const subscribe = {
    type: 'subscribe',
    channels: [
      {
        name: 'ticker',
        product_ids: ['BTC-USD'],
      },
    ],
  }

  const ws = new WebSocket('wss://ws-feed.gdax.com')
  useEffect(() => {
    console.log('useEffect called')
    if (!initialized) {
      console.log('in useEffect. !initialized')
      ws.onopen = () => {
        ws.send(JSON.stringify(subscribe))
      }

      ws.onmessage = e => {
        const value = JSON.parse(e.data)
        if (value.type !== 'ticker') {
          return
        }
        console.log('onmessage. price: ', value.price)

        const oldBtcDataSet = lineChartData.datasets[0]
        const newBtcDataSet = { ...oldBtcDataSet }
        newBtcDataSet.data.push(value.price)

        const newChartData = {
          ...lineChartData,
          datasets: [newBtcDataSet],
          labels: lineChartData.labels.concat(new Date().toLocaleTimeString()),
        }
        setLineChartData(newChartData)
      }

      setInitialized(true)
    }
    return () => {
      // if (ws) ws.close()
    }
  })

  const { classes } = props

  return (
    <div className={classes['chart-container']}>
      <Chart data={lineChartData} options={lineChartOptions} />
    </div>
  )
}

export default withStyles(styles, { withTheme: true })(CryptoChartUsingHooks)
