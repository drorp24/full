/**
 * @license Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

/** @type {LH.Config.Json} */
const config = {
  extends: 'lighthouse:default',
  settings: {
    // audits: [
    //   'first-meaningful-paint',
    //   'first-cpu-idle',
    //   'byte-efficiency/uses-optimized-images',
    //   'load-fast-enough-for-pwa',
    //   'first-cpu-idle',
    //   'largest-contentful-paint',
    //   'interactive',
    // ],
    // Skip the h2 audit so it doesn't lie to us. See https://github.com/GoogleChrome/lighthouse/issues/6539
    skipAudits: ['uses-http2', 'redirects-http'],
    categories: {
      performance: {
        //     title: 'Performance',
        //     description: 'This category judges your performance',
        auditRefs: [
          //       { id: 'first-meaningful-paint', weight: 2, group: 'metrics' },
          //       { id: 'first-cpu-idle', weight: 3, group: 'metrics' },
          // { id: 'load-fast-enough-for-pwa', weight: 5, group: 'metrics' },
          //       { id: 'largest-contentful-paint', weight: 0, group: 'metrics' },
          //       { id: 'interactive', weight: 5, group: 'metrics' },
        ],
      },
    },
  },

  // throttling: {
  // Using a "broadband" connection type
  // Corresponds to "Dense 4G 25th percentile" in https://docs.google.com/document/d/1Ft1Bnq9-t4jK5egLSOc28IL4TvR-Tt0se_1faTA4KTY/edit#heading=h.bb7nfy2x9e5v
  // rttMs: 40,
  // throughputKbps: 10 * 1024,
  // cpuSlowdownMultiplier: 1,
  // },
}

module.exports = config
