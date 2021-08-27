require('dotenv').config();

export = {
  accessKeyId: process.env.ALI_SDK_STS_ID,
  accessKeySecret: process.env.ALI_SDK_STS_SECRET,
  roleArn: process.env.ALI_SDK_STS_ROLE,
  bucket: process.env.ALI_SDK_STS_BUCKET,
  endpoint: process.env.ALI_SDK_STS_ENDPOINT,
};
