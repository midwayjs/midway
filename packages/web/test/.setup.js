const path = require('path');

process.env.MIDWAY_EGG_PLUGIN_PATH = path.join(__dirname, '../../../');
jest.setTimeout(30000);
