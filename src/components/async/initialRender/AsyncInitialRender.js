import React from 'react'
import Loadable from 'react-loadable'

const AsyncInitialRender = Loadable({
  loader: () =>
    import(/* webpackChunkName: "InitialRender" */ './InitialRender'),
  loading: () => <div>loading...</div>,
  modules: ['InitialRender'],
})

export default AsyncInitialRender
