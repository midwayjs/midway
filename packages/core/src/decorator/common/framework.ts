import {
  saveModule,
  FRAMEWORK_KEY,
  Scope,
  Provide,
  APPLICATION_KEY,
  CONFIG_KEY,
  PLUGIN_KEY,
  LOGGER_KEY,
  createCustomPropertyDecorator,
  APPLICATION_CONTEXT_KEY,
  ScopeEnum,
  FrameworkType,
} from '../';

export function Framework(): ClassDecorator {
  return (target: any) => {
    saveModule(FRAMEWORK_KEY, target);
    Scope(ScopeEnum.Singleton)(target);
    Provide()(target);
  };
}

export function Plugin(identifier?: string): PropertyDecorator {
  return createCustomPropertyDecorator(PLUGIN_KEY, {
    identifier,
  });
}

export function Config(identifier?: string): PropertyDecorator {
  return createCustomPropertyDecorator(CONFIG_KEY, {
    identifier,
  });
}

export function App(
  typeOrNamespace?: FrameworkType | string
): PropertyDecorator {
  return createCustomPropertyDecorator(APPLICATION_KEY, {
    type: typeOrNamespace,
  });
}

export function Logger(identifier?: string): PropertyDecorator {
  return createCustomPropertyDecorator(LOGGER_KEY, {
    identifier,
  });
}

export function ApplicationContext(): PropertyDecorator {
  return createCustomPropertyDecorator(APPLICATION_CONTEXT_KEY, {});
}
