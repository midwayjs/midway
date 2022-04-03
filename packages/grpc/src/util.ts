import * as protoLoader from '@grpc/proto-loader';

export const loadProto = (options: {
  protoPath: string;
  loaderOptions?: any;
}) => {
  return protoLoader.loadSync(
    options.protoPath,
    Object.assign(
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
      options.loaderOptions || {}
    )
  );
};

export const finePackageProto = (allProto: any, packageName: string) => {
  const packages = packageName.split('.');
  let currentProto = allProto;
  for (const pkg of packages) {
    if (currentProto[pkg]) {
      currentProto = currentProto[pkg];
    }
  }
  return currentProto;
};
