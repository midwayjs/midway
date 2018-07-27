const path = require('path');

module.exports = {
  keys: 'key',
  configLocations: [
    path.join(__dirname, '../resources/main.xml')
  ],
  plugins: {
    plugin2: true
  }
};