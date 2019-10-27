// Detects if device is on iOS
export const isIos = () => {
  const userAgent =
    typeof window === 'object' && window.navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(userAgent)
}
// Detects if device is in standalone mode
export const isInStandaloneMode = () =>
  typeof window === 'object' &&
  'standalone' in window.navigator &&
  window.navigator.standalone

export const inBrowser = () => typeof window !== 'undefined'
