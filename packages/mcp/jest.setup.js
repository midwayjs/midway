const path = require('path');
// set plugin dir
process.env.MIDWAY_EGG_PLUGIN_PATH = path.join(__dirname, '../../');
process.env.MIDWAY_FRAMEWORK_PATH = path.join(__dirname, '../web');
process.env.MIDWAY_FAAS_PATH = path.join(__dirname, '../faas');
process.env.MIDWAY_TS_MODE = 'true';
jest.setTimeout(30000);
