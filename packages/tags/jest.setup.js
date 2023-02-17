process.env.MIDWAY_TS_MODE = 'true';
const { join } = require('path');
// Little fix for Jest, see https://stackoverflow.com/a/54175600
require(join(__dirname, './node_modules/iconv-lite')).encodingExists('foo');
jest.setTimeout(1000000);
