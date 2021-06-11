import {
  Controller,
  Get,
  Param,
  Provide,
  Inject,
  App,
} from '@midwayjs/decorator';
import { readFileSync } from 'fs';
import { join, extname } from 'path';
import {
  safeRequire,
  IMidwayApplication,
  MidwayFrameworkType,
} from '@midwayjs/core';
import { SwaggerGenerator } from '../service/generator';

@Provide()
@Controller('/swagger-ui')
export class SwaggerController {
  swaggerUiAssetPath: string;

  @App()
  app: IMidwayApplication;

  @Inject()
  ctx: any;

  @Inject()
  swaggerGenerator: SwaggerGenerator;

  constructor() {
    const { getAbsoluteFSPath } = safeRequire('swagger-ui-dist');
    this.swaggerUiAssetPath = getAbsoluteFSPath();
  }

  @Get('/json')
  async renderJSON() {
    return this.swaggerGenerator.generate();
  }

  @Get('/')
  @Get('/:fileName')
  async renderSwagger(@Param() fileName: string) {
    if (!this.swaggerUiAssetPath) {
      return 'please run "npm install swagger-ui-dist" first';
    }
    if (!fileName) {
      fileName = '/index.html';
    }

    const resourceAbsolutePath = join(this.swaggerUiAssetPath, fileName);

    if (extname(fileName)) {
      // 7 天内使用缓存
      if (this.app.getFrameworkType() === MidwayFrameworkType.WEB_EXPRESS) {
        this.ctx.res.type(extname(fileName));
        this.ctx.res.set('cache-control', 'public, max-age=604800');
      } else {
        this.ctx.type = extname(fileName);
        this.ctx.set('cache-control', 'public, max-age=604800');
      }
    }

    if (fileName.indexOf('index.html') !== -1) {
      const htmlContent = this.getSwaggerUIResource(
        resourceAbsolutePath,
        'utf-8'
      );
      return htmlContent.replace(
        'https://petstore.swagger.io/v2/swagger.json',
        '/swagger-ui/json'
      );
    } else {
      return this.getSwaggerUIResource(resourceAbsolutePath);
    }
  }

  getSwaggerUIResource(requestPath, encoding?: 'utf-8') {
    return readFileSync(requestPath, {
      encoding,
    });
  }
}
