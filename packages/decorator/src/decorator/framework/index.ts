import {
  APPLICATION_KEY,
  CONFIG_KEY,
  PLUGIN_KEY,
  LOGGER_KEY,
  MidwayFrameworkType,
  createCustomPropertyDecorator, APPLICATION_CONTEXT_KEY,
} from '../../';

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

export function App(type?: MidwayFrameworkType): PropertyDecorator {
  return createCustomPropertyDecorator(APPLICATION_KEY, {
    type,
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
