import { Framework, IMidwayGRPCApplication, IMidwayGRPFrameworkOptions } from '../src';
import { join } from 'path';
import { close, createApp } from '@midwayjs/mock';
import { loadProto } from '../src/util';
import { credentials, loadPackageDefinition } from '@grpc/grpc-js';

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

export const createGRPCConsumer = async <T>(options: IMidwayGRPFrameworkOptions): Promise<T> => {
  const packageDefinition = await loadProto(options);
  const packageProto: any = loadPackageDefinition(packageDefinition)[options.package];
  for (const definition in packageDefinition) {
    if (!packageDefinition[definition]['format']) {
      const serviceName = definition.replace(`${options.package}.`, '');
      const connectionService = new packageProto[serviceName](options.host + ':' + options.port, credentials.createInsecure());
      return connectionService;
    //   return async (...args) => {
    //     return new Promise((resolve, reject) => {
    //       connectionService(args[0], (err, response) => {
    //         if (err) {
    //           reject(err);
    //         }
    //         console.log('Greeting:', response.message);
    //         resolve(response);
    //       });
    //     });
    //   };
    }
  }
}
