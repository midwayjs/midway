import { ConsulOptions } from 'consul';
import * as Consul from 'consul';

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
  register: Consul.Agent.Service.RegisterOptions;
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
 * the service information
 *
 * @see [agent-list-services]{@link https://developer.hashicorp.com/consul/api-docs/agent/service#sample-response}
 */
export interface IService {
  ID: string;
  Service: string;
  Tags: any[];
  TaggedAddresses: {
    [keys: string]: { Address: string; Port: number };
  };
  Meta: { [props: string]: any };
  Namespace: string;
  Port: number;
  Address: string;
  EnableTagOverride: boolean;
  Datacenter: string;
  Weights: { Passing: number; Warning: number };
}
