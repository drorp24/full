import { temporarilySetValue } from '../src/redux/actions'

// ! Upgrading a running app to a new release
//
// * What this note is about
// This note is a collection of things I've learned the hard way. It should be taken with a grain of salt.
// Though PWA is all the rage these days, CRA, Google web and Workbox (also google) docs ignore parts of the solution.
//
// * What defines a new release
// A new release is represented by a new service-worker (s/w), which is not a new version of the service-worker.js code per se
// but an updated manifest that has the updated signed names of the files that comprise the release
//
// * When will it be detected
// To detect a new release - while the user is already in the app running some current release - the browser needs to fetch from the n/w.
// This happens when a page is reloaded or a new tab is entered.
// Of course the browser fetches also when a user enters an app, but we're dealing with cases where user is in the midst of running a code
// which is suddenly rendered obsolete by a newer one.
//
// Confusingly, the browser makes a distinciton b/w the newer s/w, which is *always* fetched from the n/w, to the other files, whose fetching
// is controlled by the (signed) names of files in the manifest of the active s/w and the policy it uses ('cache first' or whatever).
//
// To that end it's important that the s/w file itself (service-worker.js) is always returned from the server with maxAge: 0
// or else the browser may be tempted to fetch the s/w from its own cache rather than n/w, preventing it from noticing there's a new release.
// However the caching headers subject is not discussed enough in the docs; for instance, should *all* code files return maxAge 0,
// or it doesn't matter as the browser ignores their cached versions on its own cache when a s/w is in control? Not clear.
//
// * How a new s/w behaves
// When there is no service-worker already controlling the app by the time the user opens the app
// then he simply gets the most up-to-date service-worker (s/w) according to the list in the manifest.
// The updated s/w manifest will cause the cache (if existsed) to update itself by requesting new & updated files from the n/w and removing deleted ones.
//
// However when a user reloads the page for an app that is running with a service-worker already controlling it, while the server returns the
// new s/w and manifest that has the updated list of code files, the updated s/w and manifest do not replace the current active one;
// instead, they are recorded on a 'waiting' key on the registration object.
// The newer s/w would remain in a waiting state until last tab is closed - or the waiting s/w "skips waiting", either manually (DevTools) or programmatically.
// Until then, the user can reload the page and open tabs all he wants, he would still get the old code.
// The user will never know a new release is pending unless we inform him of that.
//
// * Letting the user decide when to upgrade
// The above behavior is the default behavior of service workers.
// It could technically be bypassed (how to do this is described in the redfin link below).
// In this app however, a new s/w will never start activating automatically, and this is the approach recommended in CRA docs
// and google's "web" docs (approach #3 in https://redfin.engineering/how-to-fix-the-refresh-button-when-using-service-workers-a8e27af6df68)
// Instead, we will ask the user to permit the upgrade.
// Next sections describe how to notify the user, and how to make the new waiting s/w take control over the running app.
//
// * How to detect a new release is waiting
//
// ? Push messages
// None of the docs mentions this option, but we could have the *server* push a notification to the user as soon as a new release is ready.
// As far as I understand (and I may miss here), even the 'onupdatefound' won't be fired until the user reloads a page.
// Why would the user reload a page in an native-like app is beyond me. Not discussed anywhere.
// If we didn't get out of our way to let the user know as soon as the version was released by pushing a message to his client,
// the next best thing (and the common way of doing it) is to notify him as soon as we detect the new registration.waiting s/w.
//
// ? Listening to 'onupdatefound'
// CRA docs recommend listening to the 'onupdatefound' event (and their notes below reflect that too)
// As far as I see, this event fires *once* only; the first time a new s/w is added.
// While that state can last forever, nothing, not even a page reload will trigger that event again.
// If user ignored or didn't understand the message, he would go on working with an obsolete release without realising that.
//
// ? One-off vs. periodic challenges
// While the event is one-off, the nature of such notifications is *periodic*; we want to nag the user every once in a while.
// This poses a challenge for Redux and another one for React - but nobody mentions it.
// CRA docs "leave user notification as an excercise to the reader"...
//
// ? Catching reg.waiting
// To turn that one-off event into an ongoing check, I'm listening to 'onupdatefound' as well as poll the situation every page reload ('noticeWaitingSw'),
// For such cases I also introduced self-removing (timed out) actions that occasionally record themselves on the redux side
// and caught by a SnackBar element that resides on every page and displays the message to the user.
//
// * How to install the new release
//
// ? Install the new release for the user
// If the 'registration' object which is available only as a return of a promise isn't not peculiar enough,
// and the notion that it is the registration's s/w which has to "skipWaiting" (rather than some controller above s/w's) is not weird enough,
// that s/w has to postMessage to the active s/w to kick it and replace it as the active s/w.
// Since CRA implements Workbox that generates the service-worker code in CRA apps,
// I am sending the message that Workbox's generated service-worker will respond to ({type: 'SKIP_WAITING'})
// (No mention of that anywhere!)
//
// ? Await the control change to reload and fetch the new release
// Since that process of changing control is asyc, we need the 'controllerchange' event to await that change of control
// before we can finally reload the window, which will fetch the files listed in manifest of the newly active s/w.

const isLocalhost = Boolean(
  typeof window !== 'undefined' &&
    window &&
    (window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.1/8 is considered localhost for IPv4.
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      ))
)

export default function register(store) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location)
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebookincubator/create-react-app/issues/2374
      return
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`

      if (isLocalhost) {
        // This is running on localhost. Lets check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, store)

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
              'worker. To learn more, visit https://goo.gl/SC7cgQ'
          )
          navigator.serviceWorker.addEventListener(
            'controllerchange',
            function() {
              window.location.reload()
            }
          )
        })
      } else {
        // Is not local host. Just register service worker
        registerValidSW(swUrl, store)
      }
    })

    noticeWaitingSw(store)
  }
}

function registerValidSW(swUrl, store) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the old content will have been purged and
              // the fresh content will have been added to the cache.
              // It's the perfect time to display a "New content is
              // available; please refresh." message in your web app.
              console.log('1. onupdatefound fired - notices the new waiting sw')
              temporarilySetValue('SET_DEVICE', 'newerSwWaiting', true, 30)(
                store.dispatch
              )
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.
              console.log('Content is cached for offline use.')
              temporarilySetValue('SET_DEVICE', 'contentCached', true)(
                store.dispatch
              )
            }
          }
        }
      }
    })
    .catch(error => {
      console.error('Error during service worker registration:', error)
    })
}

function checkValidServiceWorker(swUrl, store) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl)
    .then(response => {
      // Ensure service worker exists, and that we really are getting a JS file.
      if (
        response.status === 404 ||
        response.headers.get('content-type').indexOf('javascript') === -1
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then(registration => {
          registration.unregister().then(() => {
            window.location.reload()
          })
        })
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, store)
      }
    })
    .catch(() => {
      console.log(
        'No internet connection found. App is running in offline mode.'
      )
    })
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister()
    })
  }
}

function noticeWaitingSw(store) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg && reg.waiting) {
        console.log('2. noticeWaitingSw notices the new waiting sw')
        temporarilySetValue('SET_DEVICE', 'newerSwWaiting', true, 30)(
          store.dispatch
        )
      }
    })
  }
}
