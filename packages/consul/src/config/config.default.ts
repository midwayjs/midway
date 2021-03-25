export default {
  consul: {
    provider: {
      register: false,
      host: '127.0.0.1',
      port: 8500,
      strategy: 'random',
    },
    service: {
      id: null,
      name: null,
      tags: [],
      address: null,
      port: 7001,
    },
  },
};
