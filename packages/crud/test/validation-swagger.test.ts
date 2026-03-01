import { MetadataManager } from '@midwayjs/core';
import {
  applyCrudSwagger,
  applyCrudValidation,
  attachCrudSwaggerMetadata,
  resolveCrudSwaggerMeta,
  resolveCrudValidationMeta,
} from '../src';

class TestModel {}
class TestService {}
class CreateDto {}
class UpdateDto {}
class ReplaceDto {}
class QueryDto {}
class GetDto {}

const options = {
  model: TestModel,
  service: TestService as any,
  id: 'uid',
  dto: {
    create: CreateDto as any,
    update: UpdateDto as any,
    replace: ReplaceDto as any,
    query: QueryDto as any,
  },
  serialize: {
    get: GetDto as any,
    create: CreateDto as any,
    update: UpdateDto as any,
  },
};

describe('validation and swagger helpers', () => {
  it('should resolve dto bindings for each route', () => {
    expect(resolveCrudValidationMeta('list', options)).toEqual({ queryDto: QueryDto });
    expect(resolveCrudValidationMeta('create', options)).toEqual({ bodyDto: CreateDto });
    expect(resolveCrudValidationMeta('update', options)).toEqual({ bodyDto: UpdateDto });
    expect(resolveCrudValidationMeta('replace', options)).toEqual({ bodyDto: ReplaceDto });
    expect(resolveCrudValidationMeta('delete', options)).toEqual({});
  });

  it('should no-op validation when requestContext or validation service is unavailable', async () => {
    await expect(applyCrudValidation('create', options, {})).resolves.toEqual({
      bodyDto: CreateDto,
    });

    await expect(
      applyCrudValidation('create', options, {
        body: { name: 'neo' },
        ctx: {
          requestContext: {
            getAsync: jest.fn().mockRejectedValue(new Error('missing')),
          },
        },
      })
    ).resolves.toEqual({
      bodyDto: CreateDto,
    });

    await expect(
      applyCrudValidation('create', options, {
        body: { name: 'neo' },
        ctx: {
          requestContext: {
            getAsync: jest.fn().mockResolvedValue({}),
          },
        },
      })
    ).resolves.toEqual({
      bodyDto: CreateDto,
    });
  });

  it('should validate query and body payloads when configured', async () => {
    const validate = jest.fn();

    await applyCrudValidation('list', options, {
      query: { page: 1 },
      ctx: {
        requestContext: {
          getAsync: jest.fn().mockResolvedValue({ validate }),
        },
      },
    });
    await applyCrudValidation('update', options, {
      body: { name: 'neo' },
      ctx: {
        requestContext: {
          getAsync: jest.fn().mockResolvedValue({ validate }),
        },
      },
    });

    expect(validate).toHaveBeenNthCalledWith(1, QueryDto, { page: 1 });
    expect(validate).toHaveBeenNthCalledWith(2, UpdateDto, { name: 'neo' });
  });

  it('should fallback query validation payload to an empty object when query is missing', async () => {
    const validate = jest.fn();
    await applyCrudValidation('list', options, {
      ctx: {
        requestContext: {
          getAsync: jest.fn().mockResolvedValue({ validate }),
        },
      },
    });

    expect(validate).toHaveBeenCalledWith(QueryDto, {});
  });

  it('should resolve and apply swagger metadata for different routes', () => {
    expect(resolveCrudSwaggerMeta('list', options).summary).toBe('List resources');
    expect(resolveCrudSwaggerMeta('replace', options).hasBody).toBe(true);
    expect(applyCrudSwagger('detail', options)).toEqual({
      summary: 'Get resource detail',
      hasBody: false,
    });
  });

  it('should attach swagger method metadata for list, create, replace and delete', () => {
    class SwaggerController {}

    attachCrudSwaggerMetadata(SwaggerController, 'list', options);
    attachCrudSwaggerMetadata(SwaggerController, 'create', options);
    attachCrudSwaggerMetadata(SwaggerController, 'replace', options);
    attachCrudSwaggerMetadata(SwaggerController, 'delete', options);

    const listMeta =
      MetadataManager.getOwnMetadata<any[]>(
        'swagger:method_metadata',
        SwaggerController,
        'list'
      ) || [];
    const createMeta =
      MetadataManager.getOwnMetadata<any[]>(
        'swagger:method_metadata',
        SwaggerController,
        'create'
      ) || [];
    const replaceMeta =
      MetadataManager.getOwnMetadata<any[]>(
        'swagger:method_metadata',
        SwaggerController,
        'replace'
      ) || [];
    const deleteMeta =
      MetadataManager.getOwnMetadata<any[]>(
        'swagger:method_metadata',
        SwaggerController,
        'delete'
      ) || [];

    expect(
      listMeta.filter(item => item.key === 'swagger/apiParameters').length
    ).toBe(0);
    expect(
      createMeta.some(item => item.key === 'swagger/apiResponse' && item.metadata[201].type === CreateDto)
    ).toBe(true);
    expect(
      replaceMeta.some(
        item =>
          item.key === 'swagger/apiParameters' &&
          item.metadata.in === 'path' &&
          item.metadata.name === 'uid'
      )
    ).toBe(true);
    expect(
      deleteMeta.some(item => item.key === 'swagger/apiResponse' && item.metadata[204])
    ).toBe(true);
  });

  it('should attach fallback list query parameters when dto.query is absent', () => {
    class FallbackController {}

    attachCrudSwaggerMetadata(FallbackController, 'list', {
      model: TestModel,
      service: TestService as any,
    });

    const listMeta =
      MetadataManager.getOwnMetadata<any[]>(
        'swagger:method_metadata',
        FallbackController,
        'list'
      ) || [];

    expect(
      listMeta.filter(item => item.key === 'swagger/apiParameters').map(item => item.metadata.name)
    ).toEqual(['page', 'limit', 'sort', 'filter', 'search', 'join', 'fields']);
  });

  it('should attach default 200 responses for routes without a typed response model', () => {
    class FallbackController {}
    attachCrudSwaggerMetadata(FallbackController, 'list', {
      model: TestModel,
      service: TestService as any,
      dto: {
        query: QueryDto as any,
      },
    });

    const listMeta =
      MetadataManager.getOwnMetadata<any[]>(
        'swagger:method_metadata',
        FallbackController,
        'list'
      ) || [];
    expect(
      listMeta.some(item => item.key === 'swagger/apiResponse' && item.metadata[200].description === 'OK')
    ).toBe(true);
  });
});
