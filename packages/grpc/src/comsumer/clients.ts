import { Config, Init, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { credentials, loadPackageDefinition } from '@grpc/grpc-js';
import { IMidwayGRPCConfigOptions } from '../interface';
import { loadProto } from '../util';

@Provide('clients')
@Scope(ScopeEnum.Singleton)
export class GRPCClients extends Map {

  @Config('grpc')
  grpcConfig: IMidwayGRPCConfigOptions;

  @Init()
  async initService() {
    for(const cfg of this.grpcConfig['clients']) {
      const packageDefinition = await loadProto(cfg);
      const packageProto: any = loadPackageDefinition(packageDefinition)[cfg.package];
      for (const definition in packageDefinition) {
        if (!packageDefinition[definition]['format']) {
          const serviceName = definition.replace(`${cfg.package}.`, '');
          const connectionService = new packageProto[serviceName](cfg.host + ':' + cfg.port, credentials.createInsecure());
          this.set(serviceName, connectionService)
        }
      }
    }
  }

  getService<T>(serviceName: string): T {
    return this.get(serviceName);
  }

  // async sayHello(request: helloworld.HelloRequest): Promise<helloworld.HelloReply> {
  //   return new Promise((resolve, reject) => {
  //     this.client.sayHello(request, (err, response) => {
  //       if (err) {
  //         reject(err);
  //       }
  //       resolve(response);
  //     });
  //   });
  // }
}
