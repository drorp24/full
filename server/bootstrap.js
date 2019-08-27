require('dotenv/config')
// require('ignore-styles')

require('@babel/register')({
  presets: ['@babel/preset-env', '@babel/preset-react'],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    'dynamic-import-node',
    'react-loadable/babel',
    '@babel/plugin-proposal-class-properties',
  ],
})

require(`./${process.env.req}`)
