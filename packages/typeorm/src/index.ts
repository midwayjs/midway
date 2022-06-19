export const CONNECTION_KEY = 'orm:getConnection';
export {
  ENTITY_MODEL_KEY,
  EVENT_SUBSCRIBER_KEY,
  ORM_MODEL_KEY,
} from './decorator';

// /**
//  * Gets repository for the given entity.
//  */
// export type getRepository = <Entity>(
//   target: ObjectType<Entity> | EntitySchema<Entity> | string
// ) => Repository<Entity>;
// /**
//  * Gets tree repository for the given entity class or name.
//  * Only tree-type entities can have a TreeRepository, like ones decorated with @Tree decorator.
//  */
// export type getTreeRepository = <Entity>(
//   target: ObjectType<Entity> | EntitySchema<Entity> | string
// ) => TreeRepository<Entity>;
// /**
//  * Gets mongodb-specific repository for the given entity class or name.
//  * Works only if connection is mongodb-specific.
//  */
// export type getMongoRepository = <Entity>(
//   target: ObjectType<Entity> | EntitySchema<Entity> | string
// ) => MongoRepository<Entity>;
// /**
//  * Gets custom entity repository marked with @EntityRepository decorator.
//  */
// export type getCustomRepository = <T>(customRepository: ObjectType<T>) => T;

export { OrmConfiguration as Configuration } from './configuration';
export * from './decorator';

export * from './interface';
export * from './dataSourceManager';
