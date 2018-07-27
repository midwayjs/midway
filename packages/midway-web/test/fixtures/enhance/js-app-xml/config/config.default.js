const path = require('path');

module.exports = {
  keys: 'key',
  configLocations: [
    path.join(__dirname, '../resources/main.xml')
  ],
  mytest: 'this is my test',
  plugins: {
    plugin2: true
  }
};