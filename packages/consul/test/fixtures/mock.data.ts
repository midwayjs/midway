const services = [
  {
    ID: '74c581ef-35e7-4aa6-b26b-ae55e5e05ede',
    Node: 'macpro.local',
    Address: '127.0.0.1',
    Datacenter: 'dc1',
    TaggedAddresses: { lan: '127.0.0.1', wan: '127.0.0.1' },
    NodeMeta: { 'consul-network-segment': '' },
    ServiceKind: '',
    ServiceID: 'consul-demo:127.0.0.1:7001',
    ServiceName: 'consul-demo',
    ServiceTags: ['midwayjs-consul-test'],
    ServiceAddress: '127.0.0.1',
    ServiceWeights: { Passing: 2, Warning: 0 },
    ServiceMeta: {},
    ServicePort: 7001,
    ServiceEnableTagOverride: false,
    ServiceProxyDestination: '',
    ServiceProxy: {},
    ServiceConnect: {},
    CreateIndex: 53,
    ModifyIndex: 53,
  },
];

const checks = [
  {
    Node: 'macpro.local',
    CheckID: 'service:consul-demo:127.0.0.1:7001',
    Name: "Service 'consul-demo' check",
    Status: 'passing',
    Notes: '',
    Output: '',
    ServiceID: 'consul-demo:127.0.0.1:7001',
    ServiceName: 'consul-demo',
    ServiceTags: ['midwayjs-consul-test'],
    Definition: {},
    CreateIndex: 83,
    ModifyIndex: 83,
  },
];
const agentService = {
  'consul-demo:127.0.0.1:7001': {
    Service: 'consul-demo:127.0.0.1:7001',
    Address: '127.0.0.1',
    Port: 7001,
    Datacenter: 'dc1',
  },
};

const kvKey1 = [
  {
    CreateIndex: 100,
    ModifyIndex: 200,
    LockIndex: 200,
    Key: 'key1',
    Flags: 0,
    Value: 'key1_value',
    Session: 'adf4238a-882b-9ddc-4a9d-5b6758e4159e',
  },
];

export { services, checks, agentService, kvKey1 };
