import {
  EntityOptions,
  getMetadataArgsStorage,
  ObjectType,
  EntitySchema,
  Repository,
  TreeRepository,
  MongoRepository,
  Connection,
  getRepository,
} from 'typeorm';
import { ViewEntityOptions } from 'typeorm/decorator/options/ViewEntityOptions';
import { saveModule, attachClassMetadata } from '@midwayjs/core';

export const CONNECTION_KEY = 'orm:getConnection';
export const ENTITY_MODEL_KEY = 'entity_model_key';
export const EVENT_SUBSCRIBER_KEY = 'event_subscriber_key';
export const ORM_MODEL_KEY = '__orm_model_key__';
/**
 * Entity - typeorm
 * @param options EntityOptions
 */
export function EntityModel(options?: EntityOptions): ClassDecorator;
/**
 * Entity - typeorm
 * @param name string
 * @param options EntityOptions
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
      : maybeOptions) || {};
  const name = typeof nameOrOptions === 'string' ? nameOrOptions : options.name;

  return function (target) {
    if (typeof target === 'function') {
      saveModule(ENTITY_MODEL_KEY, target);
    } else {
      saveModule(ENTITY_MODEL_KEY, (target as object).constructor);
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
      saveModule(ENTITY_MODEL_KEY, (target as object).constructor);
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
  return (target, propertyKey: string) => {
    attachClassMetadata(
      ORM_MODEL_KEY,
      {
        key: {
          modelKey,
          connectionName,
        },
        propertyName: propertyKey,
      },
      target
    );
  };
}

/**
 * EventSubscriber - typeorm
 * implements EntitySubscriberInterface
 */
export function EventSubscriberModel(): ClassDecorator {
  return function (target) {
    if (typeof target === 'function') {
      saveModule(EVENT_SUBSCRIBER_KEY, target);
    } else {
      saveModule(EVENT_SUBSCRIBER_KEY, (target as object).constructor);
    }

    getMetadataArgsStorage().entitySubscribers.push({ target });
  };
}

/**
 * Gets repository for the given entity.
 */
export type getRepository = <Entity>(
  target: ObjectType<Entity> | EntitySchema<Entity> | string
) => Repository<Entity>;
/**
 * Gets tree repository for the given entity class or name.
 * Only tree-type entities can have a TreeRepository, like ones decorated with @Tree decorator.
 */
export type getTreeRepository = <Entity>(
  target: ObjectType<Entity> | EntitySchema<Entity> | string
) => TreeRepository<Entity>;
/**
 * Gets mongodb-specific repository for the given entity class or name.
 * Works only if connection is mongodb-specific.
 */
export type getMongoRepository = <Entity>(
  target: ObjectType<Entity> | EntitySchema<Entity> | string
) => MongoRepository<Entity>;
/**
 * Gets custom entity repository marked with @EntityRepository decorator.
 */
export type getCustomRepository = <T>(customRepository: ObjectType<T>) => T;

export * from './repository';
export * from './hook';

export type GetConnection = (instanceName?: string) => Connection;

/**
 * for hooks useEntityModel method
 * @param clz
 * @param instanceName
 */
export function useEntityModel<Entity>(
  clz: ObjectType<Entity>,
  connectionName?: string
): Repository<Entity> {
  return getRepository<Entity>(clz, connectionName);
}

export { OrmConfiguration as Configuration } from './configuration';
