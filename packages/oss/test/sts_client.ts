const OSS = require('ali-oss');

export function createSTSClient(accessKeyId, accessKeySecret, stsToken) {
  return new OSS({
    accessKeyId,
    accessKeySecret,
    stsToken,
    region: process.env.ALI_SDK_OSS_REGION,
    bucket: process.env.ALI_SDK_OSS_BUCKET,
    secure: true,
  });
}
