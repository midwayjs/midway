import {
  FRAMEWORK_KEY,
  Scope,
  Provide,
  APPLICATION_KEY,
  CONFIG_KEY,
  PLUGIN_KEY,
  LOGGER_KEY,
  APPLICATION_CONTEXT_KEY,
  DecoratorManager,
} from '../';
import { ScopeEnum } from '../../interface';

export function Framework(): ClassDecorator {
  return (target: any) => {
    DecoratorManager.saveModule(FRAMEWORK_KEY, target);
    Scope(ScopeEnum.Singleton)(target);
    Provide()(target);
  };
}

export function Plugin(identifier?: string): PropertyDecorator {
  return DecoratorManager.createCustomPropertyDecorator(PLUGIN_KEY, {
    identifier,
  });
}

export function Config(identifier?: string): PropertyDecorator {
  return DecoratorManager.createCustomPropertyDecorator(CONFIG_KEY, {
    identifier,
  });
}

export function App(namespace?: string): PropertyDecorator {
  return DecoratorManager.createCustomPropertyDecorator(APPLICATION_KEY, {
    type: namespace,
  });
}

export function Logger(identifier?: string): PropertyDecorator {
  return DecoratorManager.createCustomPropertyDecorator(LOGGER_KEY, {
    identifier,
  });
}

export function ApplicationContext(): PropertyDecorator {
  return DecoratorManager.createCustomPropertyDecorator(
    APPLICATION_CONTEXT_KEY,
    {}
  );
}
