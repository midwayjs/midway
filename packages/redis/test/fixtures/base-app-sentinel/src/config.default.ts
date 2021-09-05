export const redis = {
  client: {
    sentinels: [{
      host: '127.0.0.1',
      port: 26379
    }, {
      host: '127.0.0.1',
      port: 26380
    }],
    name: 'mymaster',
    password: '',
    db: '0'
  },
};
