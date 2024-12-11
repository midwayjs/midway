import { Framework, IMidwayGRPCApplication, IMidwayGRPFrameworkOptions } from '../src';
import * as grpc from '../src';
import { join } from 'path';
import { close, createLegacyApp } from '@midwayjs/mock';

/**
 * create a gRPC server
 * @param name
 * @param options
 */
export async function createServer(name: string, options?: IMidwayGRPFrameworkOptions): Promise<IMidwayGRPCApplication> {
  return createLegacyApp<Framework>(join(__dirname, 'fixtures', name), {
    imports: [
      grpc,
    ],
    ...options,
  });
}

export async function closeApp(app) {
  return close(app, {
    cleanLogsDir: true,
  });
}
