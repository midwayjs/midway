import { createFunctionalCrudRouteMap, defineCrudRoutes } from '../src/functional';
import { CrudConfigError } from '../src';

class UserModel {}
class UserService {}

describe('functional CRUD', () => {
  it('should allow CRUD routes and custom functional actions to coexist', () => {
    const crudRoutes = defineCrudRoutes({
      model: UserModel,
      service: UserService as any,
    });

    const api = {
      get(path = '/') {
        return {
          method: 'get',
          path,
          handle(fn: Function) {
            return { method: 'get', path, handler: fn };
          },
        };
      },
      post(path = '/') {
        return {
          method: 'post',
          path,
          handle(fn: Function) {
            return { method: 'post', path, handler: fn };
          },
        };
      },
      patch(path = '/') {
        return {
          method: 'patch',
          path,
          handle(fn: Function) {
            return { method: 'patch', path, handler: fn };
          },
        };
      },
      put(path = '/') {
        return {
          method: 'put',
          path,
          handle(fn: Function) {
            return { method: 'put', path, handler: fn };
          },
        };
      },
      delete(path = '/') {
        return {
          method: 'delete',
          path,
          handle(fn: Function) {
            return { method: 'delete', path, handler: fn };
          },
        };
      },
    };

    const routes = {
      ...crudRoutes(api as any),
      resetPassword: api
        .post('/:id/reset-password')
        .handle(async () => ({ ok: true })),
    };

    expect(Object.keys(routes)).toEqual([
      'list',
      'detail',
      'create',
      'update',
      'delete',
      'resetPassword',
    ]);
    expect(routes.resetPassword.method).toBe('post');
    expect(routes.resetPassword.path).toBe('/:id/reset-password');
  });

  it('should support fallback builders and enforce requestContext + service at runtime', async () => {
    const routeMap = createFunctionalCrudRouteMap(
      {} as any,
      {
        model: UserModel,
        service: UserService as any,
      }
    );

    expect(routeMap.list).toMatchObject({
      method: 'GET',
      path: '/',
    });

    await expect((routeMap.list as any).handler({ ctx: {} })).rejects.toThrow(
      CrudConfigError
    );
    await expect(
      (routeMap.list as any).handler({
        ctx: {
          requestContext: {
            getAsync: jest.fn().mockResolvedValue({
              list: jest.fn().mockResolvedValue({ ok: true }),
            }),
          },
          query: {},
        },
      })
    ).resolves.toEqual({ ok: true });
  });
});
