import { transformDefineApiSource } from '../src/vite';

describe('react vite plugin', () => {
  it('should transform defineApi source to web-safe contract', () => {
    const source = `
      import { defineApi } from '@midwayjs/core/functional';
      export const userApi = defineApi('/users', api => ({
        getUser: api.get('/:id').meta({ routerName: 'getUser' }).handle(async () => ({})),
        list: api.get('/').handle(async () => ([])),
      }), {
        ignoreGlobalPrefix: true,
        version: '2',
        versionType: 'URI',
        versionPrefix: 'v',
      });
    `;

    const contracts = transformDefineApiSource(source);
    expect(contracts).toHaveLength(1);
    expect(contracts[0].name).toBe('userApi');
    expect(contracts[0].prefix).toBe('/users');
    expect(contracts[0].controllerOptions).toMatchObject({
      ignoreGlobalPrefix: true,
      version: '2',
      versionType: 'URI',
      versionPrefix: 'v',
    });
    expect(contracts[0].routes.getUser).toEqual({
      method: 'get',
      path: '/:id',
      options: {
        routerName: 'getUser',
      },
    });
    expect(contracts[0].routes.list).toEqual({
      method: 'get',
      path: '/',
      options: {},
    });
  });

  it('should parse multiline route chains', () => {
    const source = `
      import * as MidwayFunctional from '@midwayjs/core/functional';
      const { defineApi } = MidwayFunctional;

      export const userApi = defineApi('/users', api => ({
        getUser: api
          .get('/:id')
          .meta({ routerName: 'getUser' })
          .handle(async ({ input }) => {
            return { id: input.params?.id };
          }),
        createUser: api
          .post('/')
          .meta({ routerName: 'createUser', ignoreGlobalPrefix: true })
          .handle(async ({ input }) => {
            return { name: input.body?.name };
          }),
      }));
    `;

    const contracts = transformDefineApiSource(source);
    expect(contracts).toHaveLength(1);
    expect(contracts[0].routes.getUser).toEqual({
      method: 'get',
      path: '/:id',
      options: {
        routerName: 'getUser',
      },
    });
    expect(contracts[0].routes.createUser).toEqual({
      method: 'post',
      path: '/',
      options: {
        routerName: 'createUser',
        ignoreGlobalPrefix: true,
      },
    });
  });
});
