import { ConsulOptions } from 'consul';
import * as Consul from 'consul';

/**
 * consul configuration of midway
 */
export interface IConsulOptions {
  /**
   * The Consul Original Configuration
   * @see {@link https://github.com/silas/node-consul#consuloptions|consuloptions}
   */
  options: ConsulOptions;
  /**
   * Automatic deregister,default is true
   */
  deregister: boolean;
  /**
   * The Service Registers Original Configuration
   * @see {@link https://github.com/silas/node-consul#consulagentserviceregisteroptions|consulagentserviceregisteroptions}
   */
  register: Consul.Agent.Service.RegisterOptions;
}

/**
 * service status information
 * @see {@link https://developer.hashicorp.com/consul/api-docs/health#sample-response-1| health-list-checks-for-service}
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
 * the service information
 * @see {@link {https://developer.hashicorp.com/consul/api-docs/agent/service#sample-response| agent-list-services}}
 */
export interface IService {
  ID: string;
  Service: string;
  Tags: any[];
  Meta: { [props: string]: any };
  Port: number;
  Address: string;
  SocketPath: string;
  TaggedAddresses: {
    [keys: string]: { Address: string; Port: number };
  };
  Weights: { Passing: number; Warning: number };
  EnableTagOverride: boolean;
  Datacenter: string;
}
