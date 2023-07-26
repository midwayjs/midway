import { IConsulOptions } from '../../../../../src';

export default {
  keys: 'midwayjs-consul-test',
  koa: {
    port: 7001,
  },
  consul: {
    deregister: true,
    register: {
      name: 'consul-demo',
      address: '127.0.0.1',
      port: 7001,
      dc: 'dc1',
    },
    options: {
      host: 'mock.consul.server',
      port: '8500',
      defaults: {
        token: '123213',
      },
    },
  } as IConsulOptions,
};
