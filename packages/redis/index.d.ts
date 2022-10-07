import { ClusterNode, ClusterOptions } from 'ioredis';
import * as Redis from 'ioredis';
import { RedisConfigOptions } from './dist';

export * from './dist/index';

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

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    redis?: ServiceFactoryConfigOption<RedisConfigOptions>;
  }
}
