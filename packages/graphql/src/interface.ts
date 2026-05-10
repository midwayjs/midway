import { ClassType, IMidwayContext } from '@midwayjs/core';

/**
 * Supported GraphQL root operation types.
 */
export type GraphQLOperationType = 'Query' | 'Mutation' | 'Subscription';

/**
 * Per-request GraphQL context. It is the active Midway context itself.
 */
export type MidwayGraphQLContext<
  TContext extends IMidwayContext = IMidwayContext,
> = TContext & {
  graphql?: Record<string, unknown>;
};

/**
 * User callback used to extend the active Midway context for GraphQL.
 */
export type GraphQLContextFactory<TContext extends IMidwayContext = any> = (
  context: MidwayGraphQLContext<TContext>
) => Promise<Record<string, unknown> | void> | Record<string, unknown> | void;

/**
 * Shared GraphQL configuration consumed by runtime components.
 */
export interface GraphQLBaseConfigurationOptions {
  path?: string;
  methods?: string[];
  typeDefs?: unknown;
  typePaths?: string[];
  resolvers?: Record<string, any>;
  resolverValidationOptions?: Record<string, any>;
  inheritResolversFromInterfaces?: boolean;
  resolverClasses?: ClassType[];
  contextFactory?: GraphQLContextFactory;
  graphql?: Record<string, unknown>;
}

/**
 * Metadata stored for a GraphQL resolver class.
 */
export interface GraphQLResolverMetadata {
  typeName: GraphQLOperationType | string;
}

/**
 * Metadata stored for a resolver method.
 */
export interface GraphQLFieldMetadata {
  operationType: GraphQLOperationType;
  fieldName?: string;
  methodName: string | symbol;
}

/**
 * Resolver method argument sources.
 */
export type GraphQLParamSource = 'parent' | 'args' | 'context' | 'info';

/**
 * Metadata stored for a resolver method parameter.
 */
export interface GraphQLParamMetadata {
  source: GraphQLParamSource;
  propertyKey?: string;
  parameterIndex: number;
}
