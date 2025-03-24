import Redis from 'ioredis';

export { RedisConfiguration as Configuration } from './configuration';
export * from './manager';
export * from './interface';
export * from './extension/serviceDiscovery';
export { Redis };
