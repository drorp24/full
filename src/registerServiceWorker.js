// In production, we register a service worker to serve assets from local cache.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on the "N+1" visit to a page, since previously
// cached resources are updated in the background.

// To learn more about the benefits of this model, read https://goo.gl/KwvDNy.
// This link also includes instructions on opting out of this behavior.

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

export default function register() {
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
        checkValidServiceWorker(swUrl)

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
        registerValidSW(swUrl)
      }
    })

    noticeWaitingSw()
  }
}

function registerValidSW(swUrl) {
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
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.
              console.log('Content is cached for offline use.')
            }
          }
        }
      }
    })
    .catch(error => {
      console.error('Error during service worker registration:', error)
    })
}

function checkValidServiceWorker(swUrl) {
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
        registerValidSW(swUrl)
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

// ! Notifying the user of a new release
// When there is no service-worker to control the page and the user opens another tab or reloads the page,
// the user is guaranteed to get the up-to-date s/w.
// However when there is a service-worker that controls the page, openning another tab or even reloading the page won't make the user
// get the most updated s/w. Instead, he would get the one cached by the currently active s/w. This is by design.
// It's only when he would close all tabs and enter again that the user would get the new s/w files.
// Until then, the most up-to-date files (that the server did return as he knows nothing about service workers) waited patiently in another cache,
// and the new service-worker, that represents that new release, has been filed under the 'waiting' key of the 'registration' object.
// That registration object is available by: navigator.serviceWorker.getRegistration().then(registration => console.log(registration.wating).
//
// If we didn't get out of our way to let the user know by say pushing a message that a new s/w release has just come out,
// the next best thing to notify him is by using the 'onupdatefound' event,
// which is fired upon the first page reload / tab open that ends up with a newer, 'waiting' sw alongside the current (older) active sw.
// That event is what the CRA docs recommend using and their comments below reflect that too.
// What those docs fail to mention is that this event fires *once* only.
// If the user ignored the message or didn't understand it, he can go on working with the obsolete release technically forever.
// (not sure if opening the app from a mobile's shortcut icon would install the most up-to-date one, hope it does).
//
// Below my code to check every reload if there's a newer service-worker in a 'waiting' state, which would indicate an entire new release.
// I could of course schedue that check to run periodically rather than every reload (maybe in a sw of its own).
// Workbox has their own 'waiting' event that does get fired every page reload, but identifying the waiting outside of the event is quite simple.
//
// Run upon the very start, this check will miss the 'onupdatefound' event, which takes some time to be fired, and will notice
// the extra waiting sw upon next refresh onwards. This is a good thing, as they won't nag the user at the same time.
//
function noticeWaitingSw() {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg && reg.waiting) {
        console.log('2. noticeWaitingSw notices the new waiting sw')
      }
    })
  }
}
