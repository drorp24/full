;(function() {
  var e =
      'undefined' != typeof window && window === this
        ? this
        : 'undefined' != typeof global && null != global
        ? global
        : this,
    h =
      'function' == typeof Object.defineProperties
        ? Object.defineProperty
        : function(a, b, c) {
            a != Array.prototype && a != Object.prototype && (a[b] = c.value)
          }
  function k() {
    k = function() {}
    e.Symbol || (e.Symbol = m)
  }
  var n = 0
  function m(a) {
    return 'jscomp_symbol_' + (a || '') + n++
  }
  function p() {
    k()
    var a = e.Symbol.iterator
    a || (a = e.Symbol.iterator = e.Symbol('iterator'))
    'function' != typeof Array.prototype[a] &&
      h(Array.prototype, a, {
        configurable: !0,
        writable: !0,
        value: function() {
          return q(this)
        },
      })
    p = function() {}
  }
  function q(a) {
    var b = 0
    return r(function() {
      return b < a.length ? { done: !1, value: a[b++] } : { done: !0 }
    })
  }
  function r(a) {
    p()
    a = { next: a }
    a[e.Symbol.iterator] = function() {
      return this
    }
    return a
  }
  function t(a) {
    p()
    var b = a[Symbol.iterator]
    return b ? b.call(a) : q(a)
  }
  function u(a) {
    if (!(a instanceof Array)) {
      a = t(a)
      for (var b, c = []; !(b = a.next()).done; ) c.push(b.value)
      a = c
    }
    return a
  }
  var v = 0
  function w(a, b) {
    var c = XMLHttpRequest.prototype.send,
      d = v++
    XMLHttpRequest.prototype.send = function(l) {
      for (var f = [], g = 0; g < arguments.length; ++g) f[g - 0] = arguments[g]
      var F = this
      a(d)
      this.addEventListener('readystatechange', function() {
        4 === F.readyState && b(d)
      })
      return c.apply(this, f)
    }
  }
  function x(a, b) {
    var c = fetch
    fetch = function(d) {
      for (var l = [], f = 0; f < arguments.length; ++f) l[f - 0] = arguments[f]
      return new Promise(function(d, f) {
        var g = v++
        a(g)
        c.apply(null, [].concat(u(l))).then(
          function(a) {
            b(g)
            d(a)
          },
          function(a) {
            b(a)
            f(a)
          }
        )
      })
    }
  }
  var y = 'img script iframe link audio video source'.split(' ')
  function z(a, b) {
    a = t(a)
    for (var c = a.next(); !c.done; c = a.next())
      if (
        ((c = c.value),
        b.includes(c.nodeName.toLowerCase()) || z(c.children, b))
      )
        return !0
    return !1
  }
  function A(a) {
    var b = new MutationObserver(function(c) {
      c = t(c)
      for (var b = c.next(); !b.done; b = c.next())
        (b = b.value),
          'childList' == b.type && z(b.addedNodes, y)
            ? a(b)
            : 'attributes' == b.type &&
              y.includes(b.target.tagName.toLowerCase()) &&
              a(b)
    })
    b.observe(document, {
      attributes: !0,
      childList: !0,
      subtree: !0,
      attributeFilter: ['href', 'src'],
    })
    return b
  }
  function B(a) {
    for (var b = [], c = 0; c < arguments.length; ++c) b[c - 0] = arguments[c]
    console.log.apply(console, [].concat(u(b)))
  }
  function C(a, b) {
    if (2 < a.length) return performance.now()
    var c = []
    b = t(b)
    for (var d = b.next(); !d.done; d = b.next())
      (d = d.value),
        c.push({ timestamp: d.start, type: 'requestStart' }),
        c.push({ timestamp: d.end, type: 'requestEnd' })
    b = t(a)
    for (d = b.next(); !d.done; d = b.next())
      c.push({ timestamp: d.value, type: 'requestStart' })
    c.sort(function(a, b) {
      return a.timestamp - b.timestamp
    })
    a = a.length
    for (b = c.length - 1; 0 <= b; b--)
      switch (((d = c[b]), d.type)) {
        case 'requestStart':
          a--
          break
        case 'requestEnd':
          a++
          if (2 < a) return d.timestamp
          break
        default:
          throw Error('Internal Error: This should never happen')
      }
    return 0
  }
  function D(a) {
    a = a ? a : {}
    this.w = !!a.useMutationObserver
    this.v = a.minValue || null
    a = window.__tti && window.__tti.e
    var b = window.__tti && window.__tti.o
    a
      ? (B('Consuming the long task entries already recorded.'),
        (this.a = a.map(function(a) {
          return { start: a.startTime, end: a.startTime + a.duration }
        })))
      : (this.a = [])
    b && b.disconnect()
    this.c = []
    this.b = new Map()
    this.l = null
    this.j = -Infinity
    this.i = !1
    this.h = this.g = this.u = null
    w(this.s.bind(this), this.m.bind(this))
    x(this.s.bind(this), this.m.bind(this))
    E(this)
    this.w && (this.h = A(this.B.bind(this)))
  }
  D.prototype.getFirstConsistentlyInteractive = function() {
    var a = this
    return new Promise(function(b) {
      a.u = b
      'complete' == document.readyState
        ? G(a)
        : window.addEventListener('load', function() {
            G(a)
          })
    })
  }
  function G(a) {
    B('Enabling FirstConsistentlyInteractiveDetector')
    a.i = !0
    var b = 0 < a.a.length ? a.a[a.a.length - 1].end : 0,
      c = C(a.f, a.c)
    H(a, Math.max(c + 5e3, b))
  }
  function H(a, b) {
    a.i
      ? (B(
          'Attempting to reschedule FirstConsistentlyInteractive check to ' + b
        ),
        B('Previous timer activation time: ' + a.j),
        a.j > b
          ? B(
              'Current activation time is greater than attempted reschedule time. No need to postpone.'
            )
          : (clearTimeout(a.l),
            (a.l = setTimeout(function() {
              B('Checking if First Consistently Interactive was reached...')
              var b = performance.timing.navigationStart,
                d = C(a.f, a.c),
                l =
                  (window.a && window.a.A ? 1e3 * window.a.A().C - b : 0) ||
                  performance.timing.domContentLoadedEventEnd - b
              if (a.v) var f = a.v
              else
                performance.timing.domContentLoadedEventEnd
                  ? ((f = performance.timing),
                    (f = f.domContentLoadedEventEnd - f.navigationStart))
                  : (f = null)
              var g = performance.now()
              null === f &&
                (B('No usable minimum value yet. Postponing check.'),
                H(a, Math.max(d + 5e3, g + 1e3)))
              B('Parameter values:')
              B('NavigationStart', b)
              B('lastKnownNetwork2Busy', d)
              B('Search Start', l)
              B('Min Value', f)
              B('Last busy', d)
              B('Current time', g)
              B('Long tasks', a.a)
              B('Incomplete JS Request Start Times', a.f)
              B('Network requests', a.c)
              b = a.a
              5e3 > g - d
                ? (d = null)
                : ((d = b.length ? b[b.length - 1].end : l),
                  (d = 5e3 > g - d ? null : Math.max(d, f)))
              d &&
                (a.u(d),
                B('Disabling FirstConsistentlyInteractiveDetector'),
                clearTimeout(a.l),
                (a.i = !1),
                a.g && a.g.disconnect(),
                a.h && a.h.disconnect())
              B(
                'Could not detect First Consistently Interactive. Retrying in 1 second.'
              )
              H(a, performance.now() + 1e3)
            }, b - performance.now())),
            (a.j = b),
            B('Rescheduled firstConsistentlyInteractive check at ' + b)))
      : B(
          'startSchedulingTimerTasks must be called before calling rescheduleTimer'
        )
  }
  function E(a) {
    a.g = new PerformanceObserver(function(b) {
      b = t(b.getEntries())
      for (var c = b.next(); !c.done; c = b.next())
        if (
          ((c = c.value),
          'resource' === c.entryType &&
            (B('Network request finished', c),
            a.c.push({ start: c.fetchStart, end: c.responseEnd }),
            H(a, C(a.f, a.c) + 5e3)),
          'longtask' === c.entryType)
        ) {
          B('Long task finished', c)
          var d = c.startTime + c.duration
          a.a.push({ start: c.startTime, end: d })
          H(a, d + 5e3)
        }
    })
    a.g.observe({ entryTypes: ['longtask', 'resource'] })
  }
  D.prototype.s = function(a) {
    B('Starting JS initiated request. Request ID: ' + a)
    this.b.set(a, performance.now())
    B('Active XHRs: ' + this.b.size)
  }
  D.prototype.m = function(a) {
    B('Completed JS initiated request with request ID: ' + a)
    this.b.delete(a)
    B('Active XHRs: ' + this.b.size)
  }
  D.prototype.B = function(a) {
    B('Potentially network resource fetching mutation detected', a)
    B('Pushing back FirstConsistentlyInteractive check by 5 seconds.')
    H(this, performance.now() + 5e3)
  }
  e.Object.defineProperties(D.prototype, {
    f: {
      configurable: !0,
      enumerable: !0,
      get: function() {
        return [].concat(u(this.b.values()))
      },
    },
  })
  var I = {
    getFirstConsistentlyInteractive: function(a) {
      a = a ? a : {}
      return 'PerformanceLongTaskTiming' in window
        ? new D(a).getFirstConsistentlyInteractive()
        : Promise.resolve(null)
    },
  }
  'undefined' != typeof module && module.exports
    ? (module.exports = I)
    : 'function' === typeof define && define.amd
    ? define('ttiPolyfill', [], function() {
        return I
      })
    : (window.ttiPolyfill = I)
})()
//# sourceMappingURL=tti-polyfill-debug.js.map
