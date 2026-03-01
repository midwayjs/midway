import {
  Controller,
  CUSTOM_PARAM_INJECT_KEY,
  MetadataManager,
  WEB_ROUTER_KEY,
} from '@midwayjs/core';
import { Crud } from '../src';
import { CrudConfiguration } from '../src/configuration';

class TestModel {}
class TestService {}

describe('CrudConfiguration', () => {
  it('should reject @Crud() classes without @Controller()', async () => {
    @Crud({
      model: TestModel,
      service: TestService as any,
    })
    class InvalidController {}
    expect(InvalidController).toBeDefined();

    const configuration = new CrudConfiguration();
    await expect(configuration.onConfigLoad()).rejects.toThrow('@Controller()');
    Controller('/invalid')(InvalidController);
  });

  it('should preserve existing methods/routes/params and add default param metadata branches', async () => {
    const AnonymousController = new Function(
      'return function(){ this.crudService = null; }'
    )() as any;
    Controller('/anonymous')(AnonymousController);
    Crud({
      model: TestModel,
      service: TestService as any,
      routes: {
        only: ['list', 'create', 'update', 'replace'],
      },
    })(AnonymousController);

    const originalList = function originalList() {
      return 'kept';
    };
    AnonymousController.prototype.list = originalList;
    MetadataManager.attachMetadata(
      WEB_ROUTER_KEY,
      {
        method: 'list',
        path: '/',
        requestMethod: 'get',
      },
      AnonymousController
    );
    MetadataManager.attachMetadata(
      CUSTOM_PARAM_INJECT_KEY,
      {
        key: 'test',
      },
      AnonymousController,
      'list'
    );

    const configuration = new CrudConfiguration();
    await configuration.onConfigLoad();

    expect(AnonymousController.prototype.list).toBe(originalList);
    const routes =
      MetadataManager.getOwnMetadata<any[]>(WEB_ROUTER_KEY, AnonymousController) || [];
    expect(routes.filter(route => route.method === 'list')).toHaveLength(1);
    expect(
      routes.some(route => route.method === 'create' && route.routerName === 'crud_create')
    ).toBe(true);

    const listParams =
      MetadataManager.getOwnMetadata<any[]>(
        CUSTOM_PARAM_INJECT_KEY,
        AnonymousController,
        'list'
      ) || [];
    const createParams =
      MetadataManager.getOwnMetadata<any[]>(
        CUSTOM_PARAM_INJECT_KEY,
        AnonymousController,
        'create'
      ) || [];
    const updateParams =
      MetadataManager.getOwnMetadata<any[]>(
        CUSTOM_PARAM_INJECT_KEY,
        AnonymousController,
        'update'
      ) || [];
    const replaceParams =
      MetadataManager.getOwnMetadata<any[]>(
        CUSTOM_PARAM_INJECT_KEY,
        AnonymousController,
        'replace'
      ) || [];

    expect(listParams).toHaveLength(1);
    expect(createParams[0].metadata.type).toBe('body');
    expect(updateParams).toHaveLength(2);
    expect(replaceParams).toHaveLength(2);

    expect(
      Reflect.getMetadata('design:paramtypes', AnonymousController.prototype, 'create')
    ).toEqual([Object]);
    expect(
      Reflect.getMetadata('design:paramtypes', AnonymousController.prototype, 'update')
    ).toEqual([String, Object]);
    expect(
      Reflect.getMetadata('design:paramtypes', AnonymousController.prototype, 'replace')
    ).toEqual([String, Object]);
  });
});
