import type { IMiddleware, IMidwayContext } from '@midwayjs/core';
import { safeRequire } from '@midwayjs/core';
import { Provide, Config, Init, Inject } from '@midwayjs/decorator';
import { readFileSync } from 'fs';
import { join, extname } from 'path';
import { SwaggerExplorer } from './swaggerExplorer';

@Provide()
export class SwaggerMiddleware implements IMiddleware<IMidwayContext> {
  @Config('swagger')
  private swaggerConfig: any;

  private swaggerUiAssetPath: string;

  @Inject()
  private swaggerExplorer: SwaggerExplorer;

  @Init()
  async init() {
    const { getAbsoluteFSPath } = safeRequire('swagger-ui-dist');
    if (getAbsoluteFSPath) {
      this.swaggerUiAssetPath = getAbsoluteFSPath();
    }
  }

  resolve() {
    return async (ctx: IMidwayContext, next: () => Promise<any>, options?: any) => {
      if (!this.swaggerUiAssetPath) {
        return next();
      }
      const pathname = (ctx as any).path;
      const arr = pathname.split('/');
      let lastName = arr.pop();
      if (lastName === 'index.json') {
        (ctx as any).body = this.swaggerExplorer.getData();
        return;
      }
      if (!lastName || extname(pathname) !== 'html') {
        lastName = 'index.html';
      }

      const content = readFileSync(join(this.swaggerUiAssetPath, lastName),
        { encoding: 'utf-8' });
      if (lastName === 'index.html') {
        return content.replace(
          '"https://petstore.swagger.io/v2/swagger.json"',
          `location.href.replace('/${this.swaggerConfig.swaggerPath}/index.html', '/${this.swaggerConfig.swaggerPath}/index.json')`
        );
      }

      (ctx as any).body = content;
    }
  }

  match(ctx: IMidwayContext): boolean {
    const path = (ctx as any).path;
    return path.indexOf(this.swaggerConfig.swaggerPath) > -1;
  }
}
