import { IConsulOptions } from '../../../../../src';

export default {
  keys: 'midwayjs-consul-test',
  consul: {
    deregister: true,
    register: {
      name: 'consul-demo',
      address: '192.168.101.114',
      port: 7001,
    },
    options: {
      host: '192.168.120.133',
      port: '8500',
      defaults: {
        token: '566e93b6-0740-54ff-3a3a-ecb3f5479859',
      },
    },
  } as IConsulOptions,
};
