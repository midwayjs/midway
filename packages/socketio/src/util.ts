import { createAdapter, RedisAdapterOptions } from 'socket.io-redis';

export function createRedisAdapter(
  options: { host: string; port: number } & Partial<RedisAdapterOptions>
);
export function createRedisAdapter(options: Partial<RedisAdapterOptions>);
export function createRedisAdapter(options: any) {
  if (options.host && options.port) {
    return createAdapter(
      'redis://' + options.host + ':' + options.port,
      options
    );
  }
  if (options.pubClient && options.subClient) {
    return createAdapter(options);
  }
  throw new Error('error socket adapter options');
}
