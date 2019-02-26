import React from 'react'
import Page from '../page/Page'
import { measure } from './performance'

const Dashboard = () => (
  <Page>
    <h3>Dashboard</h3>
    <div>
      {Object.keys(window.moize.getStats().profiles).map(key => (
        <>
          <p key={key}>
            <strong>{key}</strong>
          </p>
          <p>
            {Object.entries(window.moize.getStats().profiles[key]).map(
              ([key1, value]) => (
                <span key={key1} style={{ marginLeft: '1em' }}>
                  {key1}={value}
                </span>
              )
            )}
          </p>
        </>
      ))}
    </div>
    <p>{measure()}</p>
  </Page>
)

export default Dashboard
