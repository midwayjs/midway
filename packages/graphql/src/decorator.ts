import {
  DecoratorManager,
  MetadataManager,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';
import {
  GRAPHQL_FIELD_KEY,
  GRAPHQL_PARAM_KEY,
  GRAPHQL_RESOLVER_KEY,
} from './constants';
import {
  GraphQLFieldMetadata,
  GraphQLParamMetadata,
  GraphQLParamSource,
  GraphQLOperationType,
  GraphQLResolverMetadata,
} from './interface';

/**
 * Marks a class as a GraphQL resolver managed by Midway.
 */
export function Resolver(typeName: GraphQLOperationType | string = 'Query') {
  return (target: any) => {
    DecoratorManager.saveModule(GRAPHQL_RESOLVER_KEY, target);
    MetadataManager.defineMetadata(
      GRAPHQL_RESOLVER_KEY,
      { typeName } as GraphQLResolverMetadata,
      target
    );
    Provide()(target);
    Scope(ScopeEnum.Request)(target);
  };
}

function createFieldDecorator(
  operationType: GraphQLOperationType,
  fieldName?: string
) {
  return (target: any, propertyKey: string | symbol) => {
    MetadataManager.attachMetadata(
      GRAPHQL_FIELD_KEY,
      {
        operationType,
        fieldName,
        methodName: propertyKey,
      } as GraphQLFieldMetadata,
      target.constructor
    );
  };
}

/**
 * Marks a resolver method as a GraphQL Query field.
 */
export function Query(fieldName?: string): MethodDecorator {
  return createFieldDecorator('Query', fieldName) as MethodDecorator;
}

/**
 * Marks a resolver method as a GraphQL Mutation field.
 */
export function Mutation(fieldName?: string): MethodDecorator {
  return createFieldDecorator('Mutation', fieldName) as MethodDecorator;
}

/**
 * Marks a resolver method as a GraphQL Subscription field.
 */
export function Subscription(fieldName?: string): MethodDecorator {
  return createFieldDecorator('Subscription', fieldName) as MethodDecorator;
}

function createParamDecorator(
  source: GraphQLParamSource,
  propertyKey?: string
) {
  return (target: any, methodName: string | symbol, parameterIndex: number) => {
    MetadataManager.attachMetadata(
      GRAPHQL_PARAM_KEY,
      {
        source,
        propertyKey,
        parameterIndex,
      } as GraphQLParamMetadata,
      target.constructor,
      methodName
    );
  };
}

/**
 * Injects the GraphQL parent value into a resolver method parameter.
 */
export function Parent(propertyKey?: string): ParameterDecorator {
  return createParamDecorator('parent', propertyKey) as ParameterDecorator;
}

/**
 * Injects GraphQL arguments into a resolver method parameter.
 */
export function Args(propertyKey?: string): ParameterDecorator {
  return createParamDecorator('args', propertyKey) as ParameterDecorator;
}

/**
 * Injects the active Midway GraphQL context into a resolver method parameter.
 */
export function Context(propertyKey?: string): ParameterDecorator {
  return createParamDecorator('context', propertyKey) as ParameterDecorator;
}

/**
 * Injects GraphQL resolve info into a resolver method parameter.
 */
export function Info(propertyKey?: string): ParameterDecorator {
  return createParamDecorator('info', propertyKey) as ParameterDecorator;
}
