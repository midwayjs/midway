export default {
  keys: 'midwayjs-consul-test',

  consul: {
    provider: {
      register: true,
      deregister: true,
      // see consul.framework.ts plz
      host: 'mock.consul.server',
      // host: '127.0.0.1',
      port: 8500,
      strategy: 'random',
    },
    service: {
      address: '127.0.0.1',
      port: 7001,
      tags: ["midwayjs-consul-test"],
    }
  }
}
