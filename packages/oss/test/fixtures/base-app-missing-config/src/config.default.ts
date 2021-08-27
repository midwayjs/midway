const config = Object.assign({}, require('../../../config'));

export const oss = {
  client: {
    accessKeyId: config.accessKeyId,
    region: config.region,
    bucket: config.bucket,
  },
};
