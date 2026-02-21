import { transformDefineApiSource } from '../src/vite';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { apiPlugin } from '../src/vite';

describe('web-bridge vite plugin', () => {
  it('should transform defineApi source to web-safe contract', () => {
    const source = `
      import { defineApi } from '@midwayjs/core/functional';
      export const userApi = defineApi('/users', api => ({
        getUser: api.get('/:id').handle(async () => ({})),
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
      options: {},
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
          .handle(async ({ input }) => {
            return { id: input.params?.id };
          }),
        createUser: api
          .post('/')
          .meta({ ignoreGlobalPrefix: true })
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
      options: {},
    });
    expect(contracts[0].routes.createUser).toEqual({
      method: 'post',
      path: '/',
      options: {
        ignoreGlobalPrefix: true,
      },
    });
  });

  it('should invalidate virtual api module on hot update', async () => {
    const root = await fs.mkdtemp(join(tmpdir(), 'midway-react-vite-'));
    const apiDir = join(root, 'src/server/api');
    const apiFile = join(apiDir, 'user.api.ts');
    await fs.mkdir(apiDir, { recursive: true });
    await fs.writeFile(
      apiFile,
      `
import { defineApi } from '@midwayjs/core/functional';
export const userApi = defineApi('/users', api => ({
  getUser: api.get('/:id').handle(async () => ({})),
}));
      `.trim()
    );

    const plugin = apiPlugin({
      root,
      apiDir: 'src/server/api',
    });

    const id = plugin.resolveId(apiFile, undefined, {
      ssr: false,
    } as any) as string;
    expect(id).toBeTruthy();

    const virtualModule = { id };
    const invalidateModule = jest.fn();
    const updated = plugin.handleHotUpdate({
      file: apiFile,
      server: {
        moduleGraph: {
          getModuleById: (requestId: string) =>
            requestId === id ? virtualModule : null,
          invalidateModule,
        },
      },
    } as any);

    expect(invalidateModule).toHaveBeenCalledWith(virtualModule);
    expect(updated).toEqual([virtualModule]);
  });

  it('should skip rewrite for ssr by default', async () => {
    const root = await fs.mkdtemp(join(tmpdir(), 'midway-react-vite-'));
    const apiDir = join(root, 'src/server/api');
    const apiFile = join(apiDir, 'user.api.ts');
    await fs.mkdir(apiDir, { recursive: true });
    await fs.writeFile(
      apiFile,
      `
import { defineApi } from '@midwayjs/core/functional';
export const userApi = defineApi('/users', api => ({
  getUser: api.get('/:id').handle(async () => ({})),
}));
      `.trim()
    );

    const plugin = apiPlugin({
      root,
      apiDir: 'src/server/api',
    });

    const id = plugin.resolveId(apiFile, undefined, {
      ssr: true,
    } as any) as string | null;
    expect(id).toBeNull();
  });

  it('should rewrite for ssr when target is both', async () => {
    const root = await fs.mkdtemp(join(tmpdir(), 'midway-react-vite-'));
    const apiDir = join(root, 'src/server/api');
    const apiFile = join(apiDir, 'user.api.ts');
    await fs.mkdir(apiDir, { recursive: true });
    await fs.writeFile(
      apiFile,
      `
import { defineApi } from '@midwayjs/core/functional';
export const userApi = defineApi('/users', api => ({
  getUser: api.get('/:id').handle(async () => ({})),
}));
      `.trim()
    );

    const plugin = apiPlugin({
      root,
      apiDir: 'src/server/api',
      target: 'both',
    });

    const id = plugin.resolveId(apiFile, undefined, {
      ssr: true,
    } as any) as string | null;
    expect(id).toContain('\0midway-api:');
  });

  it('should resolve .js re-export to .ts api source', async () => {
    const root = await fs.mkdtemp(join(tmpdir(), 'midway-react-vite-'));
    const apiDir = join(root, 'src/server/api');
    const apiFile = join(apiDir, 'user.api.ts');
    const indexFile = join(apiDir, 'index.ts');
    await fs.mkdir(apiDir, { recursive: true });
    await fs.writeFile(
      apiFile,
      `
import { defineApi } from '@midwayjs/core/functional';
export const userApi = defineApi('/users', api => ({
  getUser: api.get('/:id').handle(async () => ({})),
}));
      `.trim()
    );
    await fs.writeFile(indexFile, `export { userApi } from './user.api.js';`);

    const plugin = apiPlugin({
      root,
      apiDir: 'src/server/api',
    });

    const id = plugin.resolveId('./user.api.js', indexFile, {
      ssr: false,
    } as any) as string | null;
    expect(id).toContain('\0midway-api:');
  });
});
