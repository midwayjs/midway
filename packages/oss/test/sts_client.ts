const OSS = require('ali-oss');

function createClient(accessKeyId, accessKeySecret, stsToken) {
  return new OSS({
    accessKeyId,
    accessKeySecret,
    stsToken,
    region: process.env.ALI_SDK_OSS_REGION,
    bucket: process.env.ALI_SDK_OSS_BUCKET,
    endpoint: process.env.ALI_SDK_OSS_ENDPOINT,
    secure: true,
    refreshSTSToken: true,
    refreshSTSTokenInterval: 5000,
  });
}

export function createSTSClient(accessKeyId, accessKeySecret, stsToken) {
  let client;
  try {
    client = createClient(accessKeyId, accessKeySecret, stsToken);
  } catch (err) {
    console.warn('create sts client error and retry');
    client = createClient(accessKeyId, accessKeySecret, stsToken);
  }

  return client;
}
