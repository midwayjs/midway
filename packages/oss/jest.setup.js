const path = require('path');
const fs = require('fs');

process.env.MIDWAY_TS_MODE = 'true';
jest.setTimeout(60000);

const envFile = path.join(__dirname, '.env');
if (!fs.existsSync(envFile)) {
  fs.writeFileSync(
    envFile,
    'ALI_SDK_OSS_REGION=oss-cn-beijing\n' +
      'ALI_SDK_OSS_ENDPOINT=\n' +
      'ALI_SDK_OSS_ID=\n' +
      'ALI_SDK_OSS_SECRET=\n' +
      'ALI_SDK_OSS_BUCKET=\n' +
      'ALI_SDK_STS_ID=\n' +
      'ALI_SDK_STS_SECRET=\n' +
      'ALI_SDK_STS_BUCKET=\n' +
      'ALI_SDK_STS_ROLE=\n' +
      'ALI_SDK_STS_ENDPOINT=https://sts.aliyuncs.com\n'
  );
  console.log('please set oss ak in .env file');
}
