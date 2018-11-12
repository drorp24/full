import React, { lazy, Suspense } from 'react'
const LazyComponent = lazy(() => import('./LazyComponent'))

export default function AsyncLazyComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  )
}
