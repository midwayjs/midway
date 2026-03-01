import { MetadataManager } from '@midwayjs/core';
import { CrudOptions, CrudRouteName, CrudSwaggerMeta } from './interface';

const DECORATORS_METHOD_METADATA = 'swagger:method_metadata';
const API_OPERATION = 'swagger/apiOperation';
const API_RESPONSE = 'swagger/apiResponse';
const API_PARAMETERS = 'swagger/apiParameters';

const SUMMARY_MAP: Record<CrudRouteName, string> = {
  list: 'List resources',
  detail: 'Get resource detail',
  create: 'Create resource',
  update: 'Update resource',
  replace: 'Replace resource',
  delete: 'Delete resource',
  createMany: 'Create resources in bulk',
  deleteMany: 'Delete resources in bulk',
};

/**
 * Resolves minimal Swagger metadata for generated routes.
 */
export function resolveCrudSwaggerMeta(
  route: CrudRouteName,
  options: CrudOptions
): CrudSwaggerMeta {
  void options;
  return {
    summary: SUMMARY_MAP[route],
    hasBody: route === 'create' || route === 'update' || route === 'replace',
  };
}

/**
 * Placeholder hook to align with existing Swagger integration points.
 */
export function applyCrudSwagger(
  route: CrudRouteName,
  options: CrudOptions
): CrudSwaggerMeta {
  return resolveCrudSwaggerMeta(route, options);
}

function attachMethodSwaggerMetadata(
  target: any,
  methodName: string,
  key: string,
  metadata: any
) {
  MetadataManager.attachMetadata(
    DECORATORS_METHOD_METADATA,
    {
      key,
      propertyName: methodName,
      metadata,
    },
    target,
    methodName
  );
}

function getResponseType(route: CrudRouteName, options: CrudOptions) {
  switch (route) {
    case 'create':
      return (
        options.serialize?.create || options.serialize?.get || options.model
      );
    case 'update':
    case 'replace':
      return (
        options.serialize?.update || options.serialize?.get || options.model
      );
    case 'detail':
      return options.serialize?.get || options.model;
    default:
      return undefined;
  }
}

/**
 * Attaches minimal swagger metadata that SwaggerExplorer can consume.
 */
export function attachCrudSwaggerMetadata(
  target: any,
  route: CrudRouteName,
  options: CrudOptions
) {
  const swaggerMeta = resolveCrudSwaggerMeta(route, options);
  attachMethodSwaggerMetadata(target, route, API_OPERATION, {
    summary: swaggerMeta.summary,
    description: '',
  });

  if (
    route === 'detail' ||
    route === 'update' ||
    route === 'replace' ||
    route === 'delete'
  ) {
    attachMethodSwaggerMetadata(target, route, API_PARAMETERS, {
      in: 'path',
      name: options.id || 'id',
      required: true,
      schema: {
        type: 'string',
      },
    });
  }

  if (route === 'list' && !options.dto?.query) {
    ['page', 'limit', 'sort', 'filter', 'search', 'join', 'fields'].forEach(
      name => {
        attachMethodSwaggerMetadata(target, route, API_PARAMETERS, {
          in: 'query',
          name,
          required: false,
          schema: {
            type: 'string',
          },
        });
      }
    );
  }

  if (route === 'delete') {
    attachMethodSwaggerMetadata(target, route, API_RESPONSE, {
      204: {
        description: 'No Content',
      },
    });
    return;
  }

  const responseType = getResponseType(route, options);
  if (!responseType) {
    attachMethodSwaggerMetadata(target, route, API_RESPONSE, {
      200: {
        description: 'OK',
      },
    });
    return;
  }

  attachMethodSwaggerMetadata(target, route, API_RESPONSE, {
    [route === 'create' ? 201 : 200]: {
      description: '',
      type: responseType,
    },
  });
}
