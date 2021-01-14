import * as protoLoader from '@grpc/proto-loader';
import { IMidwayGRPFrameworkOptions } from './interface';

export const loadProto = async (options: IMidwayGRPFrameworkOptions) => {
  return protoLoader.loadSync(options.protoPath, Object.assign({
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }, options.loaderOptions));
}
