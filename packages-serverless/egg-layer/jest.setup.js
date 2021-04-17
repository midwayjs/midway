jest.setTimeout(30000);
const { join } = require('path');
process.env.MIDWAY_TS_MODE = 'true';
process.env.EGG_FRAMEWORK_DIR = join(__dirname, '../../node_modules/egg');
process.chdir(join(__dirname, '../../'));
require('ts-node/register');
