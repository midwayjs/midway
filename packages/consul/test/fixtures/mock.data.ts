const services = [
  {
    ID: '74c581ef-35e7-4aa6-b26b-ae55e5e05ede',
    Node: 'macpro.local',
    Address: '127.0.0.1',
    Datacenter: 'dc1',
    TaggedAddresses: {lan: '127.0.0.1', wan: '127.0.0.1'},
    NodeMeta: {'consul-network-segment': ''},
    ServiceKind: '',
    ServiceID: 'ali-demo:127.0.0.1:7001',
    ServiceName: 'ali-demo',
    ServiceTags: ['midwayjs-consul-test'],
    ServiceAddress: '127.0.0.1',
    ServiceWeights: {Passing: 2, Warning: 0},
    ServiceMeta: {},
    ServicePort: 7001,
    ServiceEnableTagOverride: false,
    ServiceProxyDestination: '',
    ServiceProxy: {},
    ServiceConnect: {},
    CreateIndex: 53,
    ModifyIndex: 53
  }
];

const checks = [
  {
    Node: 'macpro.local',
    CheckID: 'service:ali-demo:127.0.0.1:7001',
    Name: "Service 'ali-demo' check",
    Status: 'passing',
    Notes: '',
    Output: '',
    ServiceID: 'ali-demo:127.0.0.1:7001',
    ServiceName: 'ali-demo',
    ServiceTags: ['midwayjs-consul-test'],
    Definition: {},
    CreateIndex: 83,
    ModifyIndex: 83
  }
];

export {services, checks};
