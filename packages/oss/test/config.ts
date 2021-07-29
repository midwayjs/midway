require('dotenv').config();

export = {
  accessKeyId: process.env.ALI_SDK_OSS_ID,
  accessKeySecret: process.env.ALI_SDK_OSS_SECRET,
  region: process.env.ALI_SDK_OSS_REGION,
  bucket: process.env.ALI_SDK_OSS_BUCKET,
  secure: true,
};
