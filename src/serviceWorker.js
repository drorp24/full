// ! Upgrading a running app to a new release
//
// * What this note is about
// This note is a collection of things I've learned the hard way. It should be taken with a grain of salt.
// Though PWA is all the rage these days, CRA, Google web and Workbox (also google) docs ignore parts of the solution.
//
// * What defines a "new release"
// A new release is represented on the devtools application tab by a new, "waiting" (yellow) service-worker (s/w)
// This is not a new version of the service-worker.js code but rather indicates that there is at least one updated file just fetched
// that is not included in the list of files that have been cached by the "current" s/w.
// (of course, a file name is changed if its content has been modified)
//
// * What does the API allow us to do with such a "release"
// Down below I'm referring to a "new release" (which really means "at least one file has a modified content") as a "new s/w".
// This is also how the navigator.serviceWorker API lets us handle such a "new release": its 'registration' obj gets a 'waiting' key as soon
// as such a new release is available, and us developers don't have to worry about which file/s have been updated; we simply postMessage a
// 'skipWaiting' message to the service worker, which takes care of "installing" the release.
//
// * When will it be detected
// To detect a new release - while the user is already in the app running some current release - the browser needs to fetch from the n/w.
// This happens when a page is reloaded or a new tab is entered.
//
// Of course the browser fetches also when a user enters an app, but in this case, unless there's any other tab for the app which is open,
// The browser / s/w would simply fetch the freshest files.
// The challenge we're dealing with here is how to detect, notify the user and install, a more updated s/w
// that has been discovered while opening another tab or reloading the page, when there *is* already an active s/w.
//
// * Is this challenge worthwhile the effort
// In most apps probably no. But some will (bugs etc) and I wanted to learn how to do it properly.
// Once I've discoeverd the recipe, it's very easy.
// Plus, it's very PWAish and native-like to 'install' a new release.
//
// * How a new s/w behaves
// When there is no service-worker already controlling the app by the time the user opens the app
// then he simply gets the most up-to-date files.
//
// However when a user reloads the page for an app that is running with a service-worker already controlling it, while the server returns the
// new s/w that has the updated list of code files, the updated s/w do not replace the current active one;
// instead, they are recorded on a 'waiting' key on the registration object.
// The newer s/w would remain in a waiting state until last tab is closed - or the waiting s/w "skips waiting", either manually (DevTools) or programmatically.
// Until then, the user can reload the page and open tabs all he wants, he would still get the old code.
// The user will never know a new release is pending unless we inform him of that.
//
// * Automatically updating vs. letting the user decide
// The above behavior is the default behavior of service workers.
// It could technically be bypassed (how to do this is described in the redfin link below).
// In this app however, a new s/w will never start activating automatically, and this is the approach recommended in CRA docs
// and google's "web" docs (approach #3 in https://redfin.engineering/how-to-fix-the-refresh-button-when-using-service-workers-a8e27af6df68)
// Instead, we will notify the user of the new release and let him decide if he would like to upgrade ('install').
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
// CRA docs recommend listening to the 'onupdatefound' event
// As far as I see, this event fires *once* only; the first time a new s/w is added.
// While the state itself can last forever, nothing, not even a page reload, will trigger that event again.
// If user ignored or didn't understand the message, he would go on working with an obsolete release without realising that.
//
// ? One-off state vs. periodic notification challenges
// While the event is one-off, the nature of such notifications is *periodic*; we want to nag the user every once in a while.
// The code that listens and/or periodically checks for such a state is obviously not in any specific component, but in some general place.
// This calls for using Redux to have that state be seen by all compnents so that user gets the message;
//
// That creates a challenge, since, if we want the message component (typically SnackBar) to be declarative,
// but at the same time have the nagging message periodic, we need to either have the message component poll the state every so often,
// or alternatively have the message triggering party make the state period and/or fade it;
// I chose the latter, since it is more React-declarativs and since I wanted the control
// over the frequency be at the part that sends the message, not the messenger.
//
// Nobody mentions these challenges. Instead, CRA docs "leave user notification as an excercise to the reader"...
//
// ? Catching reg.waiting
// To turn that one-off event into an ongoing check, I'm listening to 'onupdatefound' as well as poll the situation every page reload ('detectWaitingSw'),
// For such cases I also introduced self-removing (timed out) actions that occasionally record themselves on the redux side
// and caught by a SnackBar element that resides on every page and displays the message to the user.
//
// * Installing a new release
// Documented in 'Snackbar.js'

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

export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href)
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
        checkValidServiceWorker({ swUrl, config })

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
              'worker. To learn more, visit https://bit.ly/CRA-PWA'
          )
        })
      } else {
        // Is not local host. Just register service worker
        registerValidSW({ swUrl, config })
      }
    })

    // called with every call to register (= with every page load)
    // since that's when we want to detect if there's a new sw in a waiting status
    if (config && config.onPageLoad) config.onPageLoad()
  }
}

function registerValidSW({ swUrl, config }) {
  console.log('registerValidSW called')

  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      registration.onupdatefound = () => {
        console.log('registration.onupdatefound')

        const installingWorker = registration.installing
        if (installingWorker == null) {
          return
        }
        installingWorker.onstatechange = () => {
          console.log('installingWorker.onstatechange')

          if (installingWorker.state === 'installed') {
            console.log('registration.installing.state === installed')

            if (navigator.serviceWorker.controller) {
              console.log(
                'navigator.serviceWorker.controller => content fetched and waiting'
              )
              console.log('navigator.serviceWorker: ', navigator.serviceWorker)

              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              // This is the time to inform the user and suggest him to install the new s/w.

              if (config && config.onSwWaiting) config.onSwWaiting()
            } else {
              //
              console.log(
                ' no navigator.serviceWorker.controller => content cached'
              )
              console.log('navigator.serviceWorker: ', navigator.serviceWorker)
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.

              // TODO: check why this message isn't displaying
              console.log('Content is cached for offline use.')
              if (config && config.onContentCached) config.onContentCached()
            }
          }
        }
      }
    })
    .catch(error => {
      console.error('Error during service worker registration:', error)
    })
}

function checkValidServiceWorker({ swUrl, config }) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then(response => {
      const contentType = response.headers.get('content-type')
      // Ensure service worker exists, and that we really are getting a JS file.
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then(registration => {
          registration.unregister().then(() => {
            console.log('>>> no service-worker found; reloading!')
            window.location.reload()
          })
        })
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW({ swUrl, config })
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
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister()
      })
      .catch(error => {
        console.error(error.message)
      })
  }
}
