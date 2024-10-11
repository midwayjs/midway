import {
  FRAMEWORK_KEY,
  Scope,
  Provide,
  APPLICATION_KEY,
  CONFIG_KEY,
  PLUGIN_KEY,
  LOGGER_KEY,
  APPLICATION_CONTEXT_KEY,
  MAIN_APPLICATION_KEY,
  DecoratorManager,
} from '../';
import { ScopeEnum } from '../../interface';

/**
 * Framework decorator, use to define the framework module
 * @since 2.0.0
 */
export function Framework(): ClassDecorator {
  return (target: any) => {
    DecoratorManager.saveModule(FRAMEWORK_KEY, target);
    Scope(ScopeEnum.Singleton)(target);
    Provide()(target);
  };
}

/**
 * Plugin decorator, use to get egg plugin instance
 * @since 2.0.0
 */
export function Plugin(identifier?: string): PropertyDecorator {
  return DecoratorManager.createCustomPropertyDecorator(PLUGIN_KEY, {
    identifier,
  });
}

/**
 * Config decorator, use to get config
 * @since 2.0.0
 */
export function Config(identifier?: string): PropertyDecorator {
  return DecoratorManager.createCustomPropertyDecorator(CONFIG_KEY, {
    identifier,
  });
}

/**
 * @deprecated Use @MainApp() instead
 */
export function App(): PropertyDecorator;
/**
 * App decorator, use to get application instance, default is main application
 * If you want to get the application instance of other framework, you can use the namespace parameter to specify
 * @since 2.0.0
 */
export function App(namespace: string): PropertyDecorator;
export function App(namespace?: string): PropertyDecorator {
  return DecoratorManager.createCustomPropertyDecorator(APPLICATION_KEY, {
    type: namespace,
  });
}

/**
 * Get the main application instance
 * @since 4.0.0
 */
export function MainApp(): PropertyDecorator {
  return DecoratorManager.createCustomPropertyDecorator(
    MAIN_APPLICATION_KEY,
    {}
  );
}

/**
 * Logger decorator, use to get logger instance
 * @since 2.0.0
 */
export function Logger(identifier?: string): PropertyDecorator {
  return DecoratorManager.createCustomPropertyDecorator(LOGGER_KEY, {
    identifier,
  });
}

/**
 * ApplicationContext decorator, use to get global IoC container instance
 * @since 3.0.0
 */
export function ApplicationContext(): PropertyDecorator {
  return DecoratorManager.createCustomPropertyDecorator(
    APPLICATION_CONTEXT_KEY,
    {}
  );
}
