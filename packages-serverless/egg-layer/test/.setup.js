jest.setTimeout(30000);
const { join } = require('path');
process.env.EGG_FRAMEWORK_DIR = join(__dirname, '../../../node_modules/egg');
