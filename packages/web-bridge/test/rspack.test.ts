import { apiRspackLoader, createApiRspackRule } from '../src/rspack';

describe('web-bridge rspack loader', () => {
  it('should transform defineApi source under apiDir', () => {
    const source = `
      import { defineApi } from '@midwayjs/core/functional';
      export const userApi = defineApi('/users', api => ({
        getUser: api.get('/:id').meta({ routerName: 'getUser' }).handle(async () => ({})),
      }));
    `;

    const transformed = apiRspackLoader.call(
      {
        resourcePath: '/repo/src/server/api/user.api.ts',
        getOptions: () => ({ root: '/repo', apiDir: 'src/server/api' }),
      },
      source
    );

    expect(transformed).toContain('const userApi =');
    expect(transformed).toContain('__midwayApiMeta');
    expect(transformed).not.toContain('defineApi');
  });

  it('should skip file outside apiDir', () => {
    const source = `
      import { defineApi } from '@midwayjs/core/functional';
      export const userApi = defineApi('/users', api => ({
        getUser: api.get('/:id').handle(async () => ({})),
      }));
    `;
    const result = apiRspackLoader.call(
      {
        resourcePath: '/repo/src/web/app.tsx',
        getOptions: () => ({ root: '/repo', apiDir: 'src/server/api' }),
      },
      source
    );
    expect(result).toBe(source);
  });

  it('should create include rule for apiDir', () => {
    const rule = createApiRspackRule({
      root: '/repo',
      apiDir: 'src/server/api',
    });
    expect(rule.enforce).toBe('pre');
    expect(rule.include).toEqual(['/repo/src/server/api']);
    expect(String(rule.test)).toContain('[cm]?');
    expect(rule.use[0].loader).toBe('@midwayjs/web-bridge/rspack');
  });
});
