import React from 'react'
import Loadable from 'react-loadable'

const AsyncNotInitialRender = Loadable({
  loader: () =>
    import(/* webpackChunkName: "NotInitialRender" */ './NotInitialRender'),
  loading: () => <div>loading...</div>,
  modules: ['NotInitialRender'],
})

export default AsyncNotInitialRender
