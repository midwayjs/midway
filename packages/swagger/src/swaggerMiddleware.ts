import type {
  IMiddleware,
  IMidwayApplication,
  IMidwayContext,
  NextFunction,
} from '@midwayjs/core';
import { safeRequire } from '@midwayjs/core';
import {
  Config,
  Init,
  Inject,
  Provide,
  Scope,
  ScopeEnum,
  MidwayFrameworkType,
} from '@midwayjs/decorator';
import { readFileSync } from 'fs';
import { join, extname } from 'path';
import { SwaggerExplorer } from './swaggerExplorer';

@Provide()
@Scope(ScopeEnum.Singleton)
export class SwaggerMiddleware
  implements IMiddleware<IMidwayContext, NextFunction, unknown>
{
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

  resolve(app: IMidwayApplication) {
    if (app.getFrameworkType() === MidwayFrameworkType.WEB_EXPRESS) {
      return async (req: any, res: any, next: NextFunction) => {
        const pathname = req.path;
        if (
          !this.swaggerUiAssetPath ||
          pathname.indexOf(this.swaggerConfig.swaggerPath) === -1
        ) {
          return next();
        }
        const arr = pathname.split('/');
        let lastName = arr.pop();
        if (lastName === 'index.json') {
          res.send(this.swaggerExplorer.getData());
          return;
        }
        if (!lastName) {
          lastName = 'index.html';
        }

        let content = readFileSync(join(this.swaggerUiAssetPath, lastName), {
          encoding: 'utf-8',
        });
        if (lastName === 'index.html') {
          content = content.replace(
            '"https://petstore.swagger.io/v2/swagger.json"',
            `location.href.replace('${this.swaggerConfig.swaggerPath}/index.html', '${this.swaggerConfig.swaggerPath}/index.json')`
          );
        }
        const ext = extname(lastName);
        if (ext === '.js') {
          res.type('application/javascript');
        } else if (ext === '.map') {
          res.type('application/json');
        } else if (ext === '.css') {
          res.type('text/css');
        } else if (ext === '.png') {
          res.type('image/png');
        }

        res.send(content);
      };
    } else {
      return async (ctx: IMidwayContext, next: NextFunction) => {
        const pathname = (ctx as any).path;
        if (
          !this.swaggerUiAssetPath ||
          pathname.indexOf(this.swaggerConfig.swaggerPath) === -1
        ) {
          return next();
        }
        const arr = pathname.split('/');
        let lastName = arr.pop();
        if (lastName === 'index.json') {
          (ctx as any).body = this.swaggerExplorer.getData();
          return;
        }
        if (!lastName) {
          lastName = 'index.html';
        }

        let content = readFileSync(join(this.swaggerUiAssetPath, lastName), {
          encoding: 'utf-8',
        });
        if (lastName === 'index.html') {
          content = content.replace(
            '"https://petstore.swagger.io/v2/swagger.json"',
            `location.href.replace('${this.swaggerConfig.swaggerPath}/index.html', '${this.swaggerConfig.swaggerPath}/index.json')`
          );
        }
        const ext = extname(lastName);
        if (ext === '.js') {
          (ctx as any).set('Content-Type', 'application/javascript');
        } else if (ext === '.map') {
          (ctx as any).set('Content-Type', 'application/json');
        } else if (ext === '.css') {
          (ctx as any).set('Content-Type', 'text/css');
        } else if (ext === '.png') {
          (ctx as any).set('Content-Type', 'image/png');
        }

        (ctx as any).body = content;
      };
    }
  }
}
