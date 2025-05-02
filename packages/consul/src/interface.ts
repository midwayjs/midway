import { ServiceDiscoveryOptions, DefaultInstanceMetadata } from '@midwayjs/core';
import Consul = require('consul');

export type ConsulOptions = ConstructorParameters<typeof Consul>[0];
export type ConsulClient = InstanceType<typeof Consul>;

type GetRegisterFn<T> = T extends { register(options: any): any } ? T['register'] : never;
type GetFirstParam<T> = T extends { (options: infer P, ...args: any[]): any; (name: string): any } ? P : never;
export type RegisterOptions = GetFirstParam<GetRegisterFn<ConsulClient['agent']['service']>>;
export type GetHealthServiceOptions = GetFirstParam<GetRegisterFn<ConsulClient['health']['service']>>;

export interface ConsulInstanceMetadata extends RegisterOptions {}

export interface ConsulServiceDiscoveryOptions extends ServiceDiscoveryOptions<ConsulHealthItem> {
  serviceOptions?: ConsulInstanceMetadata | ((meta: DefaultInstanceMetadata ) => ConsulInstanceMetadata);
}

export interface ConsulHealthItem {
  Node: {
    ID: string;
    Node: string;
    Address: string;
    Datacenter: string;
    TaggedAddresses: Record<string, any>;
    Meta: Record<string, any>;
    CreateIndex: number;
    ModifyIndex: number;
  };
  Service: {
    ID: string;
    Service: string;
    Tags: string[];
    Address: string;
    TaggedAddresses: Record<string, any>;
    Meta: Record<string, any>;
    Port: number;
    Weights: Record<string, any>;
    EnableTagOverride: boolean;
    Proxy: Record<string, any>;
    Connect: Record<string, any>;
    PeerName: string;
    CreateIndex: number;
    ModifyIndex: number;
  };
  Checks: Array<{
    Node: string;
    CheckID: string;
    Name: string;
    Status: 'passing' | 'warning' | 'critical';
    Notes: string;
    Output: string;
    ServiceID: string;
    ServiceName: string;
    ServiceTags: string[];
    Type: string;
    Interval: string;
    Timeout: string;
    ExposedPort: number;
    Definition: Record<string, any>;
    CreateIndex: number;
    ModifyIndex: number;
  }>;
}
