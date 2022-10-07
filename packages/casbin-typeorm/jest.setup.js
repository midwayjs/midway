const path = require('path');
const fs = require('fs');
const envFile = path.join(__dirname, '.env');
if (!fs.existsSync(envFile)) {
  fs.writeFileSync(
    envFile,
    'TENCENT_COS_SECRET_ID=\n' + 'TENCENT_COS_SECRET_KEY=\n'
  );
  console.log('please set cos ak in .env file');
}

require('dotenv').config();
