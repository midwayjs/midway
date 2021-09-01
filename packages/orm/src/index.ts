import {
  saveClassMetadata,
  attachClassMetadata,
  saveModule,
} from '@midwayjs/decorator';
import {
  Connection,
  EntityOptions as BaseEntityOptions,
  EntitySchema,
  getMetadataArgsStorage,
  getRepository,
  MongoRepository,
  ObjectType,
  Repository,
  TreeRepository,
} from 'typeorm';
import { ViewEntityOptions } from 'typeorm/decorator/options/ViewEntityOptions';

export const CONNECTION_KEY = 'orm:getConnection';
export const ENTITY_MODEL_KEY = 'entity_model_key';
export const EVENT_SUBSCRIBER_KEY = 'event_subscriber_key';
export const ORM_MODEL_KEY = '__orm_model_key__';

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
export function EventSubscriberModel(
  options: { connectionName?: string } = {}
): ClassDecorator {
  return function (target) {
    saveModule(EVENT_SUBSCRIBER_KEY, target);
    saveClassMetadata(EVENT_SUBSCRIBER_KEY, options, target);
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

export { OrmConfiguration as Configuration } from './configuration';
export * from './hook';
export * from './repository';

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
