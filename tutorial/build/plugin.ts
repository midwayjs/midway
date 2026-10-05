import fs from 'node:fs/promises';
import path from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';
import { ContentLoader, TRACKS } from './content.ts';
import type { Locale, Track } from '../src/types.ts';

const CATALOG_ID = 'virtual:tutorial-catalog';
const VARIANT_PREFIX = 'virtual:tutorial-variant/';

const SAMPLES: Record<Track, string> = {
  class: `@Controller('/user')
export class UserController {
  @Inject()
  userService: UserService;

  @Get('/:id')
  async detail(@Param('id') id: string) {
    return this.userService.find(id);
  }
}`,
  function: `export const userApi = defineApi('/user', api => ({
  detail: api
    .get('/:id')
    .input({ params: z.object({ id: z.string() }) })
    .handle(async ({ input }) => {
      return useInject(UserService).find(input.params.id);
    }),
}));`,
};

/**
 * 把 `content/` 下的课程以虚拟模块的形式提供给前端，
 * 并在构建结束后为每个课程路由生成 index.html，保证静态托管下可以直接访问深链接。
 */
export function tutorialContent(root: string): Plugin {
  const loader = new ContentLoader(root);
  let config: ResolvedConfig;

  return {
    name: 'midway-tutorial-content',

    configResolved(resolved) {
      config = resolved;
    },

    resolveId(id) {
      if (id === CATALOG_ID || id.startsWith(VARIANT_PREFIX)) return '\0' + id;
    },

    async load(id) {
      if (!id.startsWith('\0')) return;
      const raw = id.slice(1);

      if (raw === CATALOG_ID) {
        const catalog = await loader.catalog();
        const samples = Object.fromEntries(
          await Promise.all(
            TRACKS.map(async t => [t, await loader.highlight(SAMPLES[t], 'ts')])
          )
        );
        const loaders = catalog
          .map(
            ({ track, locale }) =>
              `${JSON.stringify(`${track}/${locale}`)}: () => import(${JSON.stringify(
                `${VARIANT_PREFIX}${track}/${locale}`
              )})`
          )
          .join(',\n');
        return [
          `export const catalog = ${JSON.stringify(catalog)};`,
          `export const samples = ${JSON.stringify(samples)};`,
          `export const loaders = {\n${loaders}\n};`,
        ].join('\n');
      }

      if (raw.startsWith(VARIANT_PREFIX)) {
        const [track, locale] = raw.slice(VARIANT_PREFIX.length).split('/') as [
          Track,
          Locale,
        ];
        const variant = await loader.variant(track, locale);
        return `export default ${JSON.stringify(variant)};`;
      }
    },

    configureServer(server) {
      server.watcher.add(loader.watchDirs);
      const reload = (file: string) => {
        if (!loader.watchDirs.some(dir => file.startsWith(dir))) return;
        for (const mod of server.moduleGraph.idToModuleMap.values()) {
          if (mod.id?.startsWith('\0virtual:tutorial')) {
            server.moduleGraph.invalidateModule(mod);
          }
        }
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('add', reload);
      server.watcher.on('change', reload);
      server.watcher.on('unlink', reload);
    },

    async closeBundle() {
      if (config.command !== 'build') return;
      const outDir = path.resolve(config.root, config.build.outDir);
      const indexHtml = await fs.readFile(path.join(outDir, 'index.html'), 'utf8');
      const routes: string[] = [];

      for (const entry of await loader.catalog()) {
        const prefix = `${entry.track}/${entry.locale}`;
        routes.push(prefix);
        for (const part of entry.parts) {
          for (const lesson of part.lessons) {
            routes.push(`${prefix}/${part.slug}/${lesson.slug}`);
          }
        }
      }

      for (const route of routes) {
        const dir = path.join(outDir, route);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(path.join(dir, 'index.html'), indexHtml);
      }
    },
  };
}
