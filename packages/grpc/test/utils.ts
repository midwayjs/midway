import { Framework, IMidwayGRPCApplication, IMidwayGRPFrameworkOptions } from '../src';
import { join } from 'path';
import { close, createApp } from '@midwayjs/mock';

/**
 * create a gRPC server
 * @param name
 * @param options
 */
export async function createServer(name: string, options: IMidwayGRPFrameworkOptions = {}): Promise<IMidwayGRPCApplication> {
  return createApp<Framework>(join(__dirname, 'fixtures', name), options, Framework);
}

export async function closeApp(app) {
  return close(app);
}
