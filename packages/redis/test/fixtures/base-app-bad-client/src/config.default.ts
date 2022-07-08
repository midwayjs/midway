export const redis = {
  client: {
    host: '127.0.0.2',
    port: 6379,
    password: '',
    db: '0',
    connectTimeout: 2e3,
    retryStrategy: () => null
  },
};
