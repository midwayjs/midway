import {
  createCustomPropertyDecorator,
  savePropertyInject,
} from '../decoratorManager';
import {
  IDataSourceManager,
  IServiceFactory,
  ObjectIdentifier,
} from '../../interface';
import {
  FACTORY_DATASOURCE_INSTANCE_KEY,
  FACTORY_SERVICE_CLIENT_KEY,
} from '../constant';

export function Inject(identifier?: ObjectIdentifier) {
  return function (target: any, targetKey: string): void {
    savePropertyInject({ target, targetKey, identifier });
  };
}

export function InjectClient(
  serviceFactoryClz: new (...args) => IServiceFactory<unknown>,
  clientName?: string
) {
  return createCustomPropertyDecorator(FACTORY_SERVICE_CLIENT_KEY, {
    serviceFactoryClz,
    clientName,
  });
}

export function InjectDataSource(
  dataSourceManagerClz: new (...args) => IDataSourceManager<unknown>,
  instanceName?: string
) {
  return createCustomPropertyDecorator(FACTORY_DATASOURCE_INSTANCE_KEY, {
    dataSourceManagerClz,
    instanceName,
  });
}
