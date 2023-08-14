import Consul from 'consul';

type ConsulOptions = ConstructorParameters<typeof Consul>[0];

/**
 * consul configuration of midwayjs
 */
export interface IConsulOptions {
  /**
   * The Consul Original Configuration
   *
   * @see [consuloptions]{@link https://github.com/silas/node-consul#consuloptions}
   */
  options: ConsulOptions;
  /**
   * Automatic deregister,default is true
   */
  deregister: boolean;
  /**
   * The Service Registers Original Configuration
   *
   *@see [consul.agent.service.register.options]{@link https://github.com/silas/node-consul#consulagentserviceregisteroptions}
   */
  register: typeof Consul.Agent.Service;
}

/**
 * service status information
 *
 *@see [health-list-checks-for-service]{@link https://developer.hashicorp.com/consul/api-docs/health#sample-response-1}
 */
export interface IServiceHealth {
  Node: string;
  CheckID: string;
  Name: string;
  Status: 'passing' | 'warning' | 'critical';
  Notes: string;
  Output: string;
  ServiceID: string;
  ServiceName: string;
  ServiceTags: any[];
  Type: string;
  ExposedPort: number;
  Definition: { [props: string]: any };
  CreateIndex: number;
  ModifyIndex: number;
}

/**
 * List Nodes for Service
 * @see [List Nodes for Service](https://developer.hashicorp.com/consul/api-docs/catalog#sample-response-3)
 */
export interface IServiceNode {
  ID: string;
  Node: string;
  Address: string;
  Datacenter: string;
  TaggedAddresses: {
    lan: string;
    wan: string;
  };
  NodeMeta: { [key: string]: string };
  CreateIndex: number;
  ModifyIndex: number;
  ServiceAddress: string;
  ServiceEnableTagOverride: boolean;
  ServiceID: string;
  ServiceName: string;
  ServicePort: number;
  ServiceMeta: { [key: string]: string };
  ServiceTaggedAddresses: {
    lan: { address: string; port: number };
    wan: { address: string; port: number };
  };
  ServiceTags: Array<string>;
  ServiceProxy: {
    DestinationServiceName: string;
    DestinationServiceID: string;
    LocalServiceAddress: string;
    LocalServicePort: number;
    Config: string;
    Upstreams: string;
  };
  ServiceConnect: {
    Native: boolean;
    Proxy: string;
  };
  Namespace: string;
}

// noinspection JSUnusedGlobalSymbols
/**
 * @see [consul.kv.get]{@link https://github.com/silas/node-consul#consulkvgetoptions}
 */
export type TKvGet = {
  CreateIndex: number;
  ModifyIndex: number;
  LockIndex: number;
  Key: string;
  Flags: number;
  Value: string;
};
// noinspection JSUnusedGlobalSymbols
/**
 * @see [consul.kv.keys]{@link https://github.com/silas/node-consul#consulkvkeysoptions}
 */
export type TKvKeys = Array<string>;
