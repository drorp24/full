// In production, we register a service worker to serve assets from local cache.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on the "N+1" visit to a page, since previously
// cached resources are updated in the background.

// To learn more about the benefits of this model, read https://goo.gl/KwvDNy.
// This link also includes instructions on opting out of this behavior.

// ! Periodical events
// 'temporarilySetValue' sets a value in the redux store and then removes it after a while.
// This enables to turn *ongoing* states (e.g. 'new release is ready') into *periodical*, recurring events.
// This approach works well with React, that doesn't create elements as part of events (as jQuery would)
// enabling a communication component such as <SnackBar /> to reside permanently on every page
// and respond to changes on some state it's exposed to.
// (see also note on SnackBar.js)
//
// 'temporarilySetValue' returns a function of 'dispatch' so it's a kind of thunk.
//  Here I'm using 'store.dispatch' directly so I'm including it.
//
import { temporarilySetValue } from '../src/redux/actions'

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

// ! Notifying and installing a new release
//
// * Why we need to notify the user of a newer release pending
//
// When there is no service-worker to control the page yet and the user opens the app or reloads the page with no other tab open for the app,
// the user is guaranteed to get the most up-to-date service-worker (s/w) and manifest if one has since updated.
// The updated s/w manifest will cause the cache (if existsed) to update itself by requesting new & updated files from the n/w and removing deleted ones.
//
// However when a user reloads the page for an app that is running with a service-worker already controlling it, while the server returns the
// new s/w and manifest that has the updated list of code files, the updated s/w and manifest do not replace the current active one;
// instead, they are recorded on a 'waiting' key on the registration object
// The newer s/w would remain in a waiting state until last tab is closed
// Until then, the user can reload the page and open tabs all he wants, he would still get the old code.
// The user will never know a new release is pending unless we inform him of that.
//
// * How to notify user and install the new release for him
//
// ? Listening to 'onupdatefound' (not enough)
// If we didn't get out of our way to let the user know as soon as the version was released by pushing a message to his client,
// the next best thing (and the common way of doing it) is to notify him as soon as we notice the new registration.waiting s/w.
// This will happen when the user reloads the page or enter a new tab.
// CRA docs recommend listening to the 'onupdatefound' event (and their notes below reflect that too)
// But this event fires *once* only; If user ignored or didn't understand it, he would go on working with the obsolete release.
//
// ? Catching reg.waiting (not enough)
// In my mind, listening to the above event is not enough; we need to poll the situation every once in a while and nag the user to update.
// I could poll the following every page reload (or more frequently if I wanted to):
// navigator.serviceWorker.getRegistration().then(reg => {if (reg && reg.waiting) {notify user...}})
// Tried that and it worked well, but I wanted to also install the new release for the user
//
// ? Install the new release for the user
// This entails postMesage()ing the active s/w a message that will make it skipWaiting() (there's an open issue to make it easier)
// Since I don't have access the service-worker's code, I will use Workbox for that.
// Workbox 4 conveniently added the workbox-window interface that enables to communicate with the service-worker,
// particularly allowing me to tell the service-worker to SKIP_WAITING.
// They even fire a 'waiting' event every page load if reg.waiting exists, saving me to home make it.
// https://developers.google.com/web/tools/workbox/guides/advanced-recipes
//
// ? Closing thoughts
// - How did developers managed to programmtically install before that change?? CRA doesn't let you touch service worker code!
// - with all the hype and the hundreds posts about PWA, nobody seems to talk about installing. Why do both CRA docs and google PWA docs
//   ignore the install challenge completely when this is clearly desired and demonstrated in google's MD examples??
//
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
