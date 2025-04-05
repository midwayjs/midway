import { ServiceDiscoveryOptions, DefaultInstanceMetadata, ServiceDiscoveryBaseInstance } from '@midwayjs/core';
import Consul = require('consul');

export type ConsulOptions = ConstructorParameters<typeof Consul>[0];
export type ConsulClient = InstanceType<typeof Consul>;

type GetRegisterFn<T> = T extends { register(options: any): any } ? T['register'] : never;
type GetFirstParam<T> = T extends { (options: infer P, ...args: any[]): any; (name: string): any } ? P : never;
export type RegisterOptions = GetFirstParam<GetRegisterFn<ConsulClient['agent']['service']>>;

export interface ConsulInstanceMetadata extends RegisterOptions, ServiceDiscoveryBaseInstance {}

export interface ConsulServiceDiscoveryOptions extends Omit<ServiceDiscoveryOptions<ConsulInstanceMetadata>, 'healthCheckOptions'> {
  serviceOptions?: ConsulInstanceMetadata | ((meta: DefaultInstanceMetadata ) => ConsulInstanceMetadata);
  healthCheckType?: 'self';
}
