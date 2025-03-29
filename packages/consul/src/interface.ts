import { ServiceDiscoveryOptions } from '@midwayjs/core';
import Consul = require('consul');

export type ConsulOptions = ConstructorParameters<typeof Consul>[0];
export type ConsulClient = InstanceType<typeof Consul>;

export interface ConsulServiceDiscoveryOptions extends ServiceDiscoveryOptions {
  check?: {
    tcp?: string;
    http?: string;
    script?: string;
    interval?: string;
    ttl?: string;
    notes?: string;
    status?: string;
  };
}