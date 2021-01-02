import { Framework, IMidwayGRPCApplication, IMidwayGRPConfigurationOptions } from '../src';
import { join } from 'path';
import { close, createApp } from '@midwayjs/mock';

import * as protoLoader from '@grpc/proto-loader';

/**
 * create a gRPC server
 * @param name
 * @param options
 */
export async function creatApp(name: string, options: IMidwayGRPConfigurationOptions = {}): Promise<IMidwayGRPCApplication> {
  options.packageDefinition = protoLoader.loadSync(options.protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });
  return createApp<Framework>(join(__dirname, 'fixtures', name), options, Framework);
}

export async function closeApp(app) {
  return close(app);
}
