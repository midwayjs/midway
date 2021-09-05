export const redis = {
  default: {},
  // redis client will try to use TIME command to detect client is ready or not
  // if your redis server not support TIME command, please set this config to false
  // see https://redis.io/commands/time
  supportTimeCommand: true,
  //  Redis: require('ioredis'), // customize ioredis version, only set when you needed

  // Single Redis
  // client: {
  //   host: 'host',
  //   port: 'port',
  //   family: 'user',
  //   password: 'password',
  //   db: 'db',
  // },

  // Cluster Redis
  // client: {
  //   cluster: true,
  //   nodes: [{
  //     host: 'host',
  //     port: 'port',
  //     family: 'user',
  //     password: 'password',
  //     db: 'db',
  //   },{
  //     host: 'host',
  //     port: 'port',
  //     family: 'user',
  //     password: 'password',
  //     db: 'db',
  //   },
  // ]},

  // Multi Redis
  // clients: {
  //   instance1: {
  //     host: 'host',
  //     port: 'port',
  //     family: 'user',
  //     password: 'password',
  //     db: 'db',
  //   },
  //   instance2: {
  //     host: 'host',
  //     port: 'port',
  //     family: 'user',
  //     password: 'password',
  //     db: 'db',
  //   },
  // },
};
