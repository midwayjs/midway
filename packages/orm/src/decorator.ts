import { EntityOptions as BaseEntityOptions } from 'typeorm/decorator/options/EntityOptions';
import {
  createCustomPropertyDecorator,
  saveClassMetadata,
  saveModule,
} from '@midwayjs/decorator';
import { getMetadataArgsStorage } from 'typeorm';
import { ViewEntityOptions } from 'typeorm/decorator/options/ViewEntityOptions';
import { ENTITY_MODEL_KEY, EVENT_SUBSCRIBER_KEY, ORM_MODEL_KEY } from './index';

export interface EntityOptions extends BaseEntityOptions {
  connectionName?: string;
}

/**
 * Entity - typeorm
 * @param options EntityOptions
 */
export function EntityModel(options?: EntityOptions): ClassDecorator;
/**
 * Entity - typeorm
 * @param name string
 * @param options EntityOptions & connectionName
 */
export function EntityModel(
  name?: string,
  options?: EntityOptions
): ClassDecorator;
/**
 * Entity - typeorm
 * @param nameOrOptions string|EntityOptions
 * @param maybeOptions EntityOptions
 */
export function EntityModel(
  nameOrOptions?: string | EntityOptions,
  maybeOptions?: EntityOptions
): ClassDecorator {
  const options =
    (typeof nameOrOptions === 'object'
      ? (nameOrOptions as EntityOptions)
      : maybeOptions) || ({} as any);
  const name = typeof nameOrOptions === 'string' ? nameOrOptions : options.name;
  const connectionName = options?.connectionName || 'ALL';
  return function (target) {
    if (typeof target === 'function') {
      saveModule(ENTITY_MODEL_KEY, target);
      saveClassMetadata(ENTITY_MODEL_KEY, { connectionName }, target);
    } else {
      saveModule(ENTITY_MODEL_KEY, (target as any).constructor);
      saveClassMetadata(
        ENTITY_MODEL_KEY,
        { connectionName },
        (target as any).constructor
      );
    }

    getMetadataArgsStorage().tables.push({
      target: target,
      name: name,
      type: 'regular',
      orderBy: options.orderBy ? options.orderBy : undefined,
      engine: options.engine ? options.engine : undefined,
      database: options.database ? options.database : undefined,
      schema: options.schema ? options.schema : undefined,
      synchronize: options.synchronize,
      withoutRowid: options.withoutRowid,
    });
  };
}

/**
 * ViewEntity - typeorm
 * @param options ViewEntityOptions
 */
export function EntityView(options?: ViewEntityOptions): ClassDecorator;
/**
 * Entity - ViewEntity
 * @param name string
 * @param options ViewEntityOptions
 */
export function EntityView(
  name?: string,
  options?: ViewEntityOptions
): ClassDecorator;
/**
 * Entity - typeorm
 * @param nameOrOptions string|ViewEntityOptions
 * @param maybeOptions ViewEntityOptions
 */
export function EntityView(
  nameOrOptions?: string | ViewEntityOptions,
  maybeOptions?: ViewEntityOptions
): ClassDecorator {
  const options =
    (typeof nameOrOptions === 'object'
      ? (nameOrOptions as ViewEntityOptions)
      : maybeOptions) || {};
  const name = typeof nameOrOptions === 'string' ? nameOrOptions : options.name;

  return function (target) {
    if (typeof target === 'function') {
      saveModule(ENTITY_MODEL_KEY, target);
    } else {
      saveModule(ENTITY_MODEL_KEY, (target as any).constructor);
    }

    getMetadataArgsStorage().tables.push({
      target: target,
      name: name,
      type: 'view',
      database: options.database ? options.database : undefined,
      schema: options.schema ? options.schema : undefined,
      expression: options.expression ? options.expression : undefined,
      materialized: options.materialized ? options.materialized : undefined,
      synchronize: options.synchronize,
    });
  };
}

export function InjectEntityModel(modelKey?: any, connectionName = 'default') {
  return createCustomPropertyDecorator(ORM_MODEL_KEY, {
    modelKey,
    connectionName,
  });
}

/**
 * EventSubscriber - typeorm
 * implements EntitySubscriberInterface
 */
export function EventSubscriberModel(
  options: { connectionName?: string } = {}
): ClassDecorator {
  return function (target) {
    saveModule(EVENT_SUBSCRIBER_KEY, target);
    saveClassMetadata(EVENT_SUBSCRIBER_KEY, options, target);
  };
}
