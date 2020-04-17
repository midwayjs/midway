const path = require('path');
const fs = require('fs');

module.exports = {
  entry: 'src/index',
  publicPath: './',
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
  plugins: [
    [
      'ice-plugin-fusion',
      {
        themePackage: '@alifd/theme-element',
      },
    ],
    [
      'ice-plugin-moment-locales',
      {
        locales: ['zh-cn'],
      },
    ]
  ],
};
