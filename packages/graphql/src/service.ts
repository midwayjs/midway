import {
  DecoratorManager,
  IMidwayContainer,
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
  GraphQLBaseConfigurationOptions,
  GraphQLFieldMetadata,
  GraphQLParamMetadata,
  GraphQLResolverMetadata,
} from './interface';

function readSourceValue(source: any, propertyKey?: string) {
  if (!propertyKey) {
    return source;
  }
  return source?.[propertyKey];
}

function buildMethodArgs(
  params: GraphQLParamMetadata[],
  parent: any,
  args: any,
  context: any,
  info: any
) {
  if (!params.length) {
    return [parent, args, context, info];
  }

  const methodArgs = [];
  for (const param of params) {
    const sourceValue =
      param.source === 'parent'
        ? parent
        : param.source === 'args'
          ? args
          : param.source === 'context'
            ? context
            : info;
    methodArgs[param.parameterIndex] = readSourceValue(
      sourceValue,
      param.propertyKey
    );
  }
  return methodArgs;
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class GraphQLService {
  /**
   * Merges configured resolver maps with Midway-managed resolver classes.
   */
  buildResolvers(
    config: GraphQLBaseConfigurationOptions,
    container: IMidwayContainer
  ) {
    const resolvers = {
      ...(config.resolvers || {}),
    };
    const resolverClasses = [
      ...DecoratorManager.listModule(GRAPHQL_RESOLVER_KEY),
      ...(config.resolverClasses || []),
    ];

    for (const resolverClass of resolverClasses) {
      const resolverMeta = MetadataManager.getMetadata<GraphQLResolverMetadata>(
        GRAPHQL_RESOLVER_KEY,
        resolverClass
      ) || { typeName: 'Query' };
      const fields =
        MetadataManager.getMetadata<GraphQLFieldMetadata[]>(
          GRAPHQL_FIELD_KEY,
          resolverClass
        ) || [];

      for (const field of fields) {
        const typeName =
          field.operationType || resolverMeta.typeName || 'Query';
        const fieldName = field.fieldName || String(field.methodName);
        const params =
          MetadataManager.getMetadata<GraphQLParamMetadata[]>(
            GRAPHQL_PARAM_KEY,
            resolverClass,
            field.methodName
          ) || [];
        const resolveHandler = async (parent, args, context, info) => {
          const requestContainer = context?.requestContext || container;
          const instance = await requestContainer.getAsync(resolverClass);
          return await instance[field.methodName](
            ...buildMethodArgs(params, parent, args, context, info)
          );
        };
        resolvers[typeName] = resolvers[typeName] || {};
        resolvers[typeName][fieldName] =
          field.operationType === 'Subscription'
            ? {
                subscribe: resolveHandler,
              }
            : resolveHandler;
      }
    }

    return resolvers;
  }
}
