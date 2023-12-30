import { MidwayCommonError, safeRequire } from '@midwayjs/core';
import type { SwaggerOptions } from './interfaces';
import { readFileSync } from 'fs';
import { extname, join } from 'path';

export function renderSwaggerUI(swaggerConfig: SwaggerOptions) {
  const { getAbsoluteFSPath } = safeRequire('swagger-ui-dist');
  if (!getAbsoluteFSPath) {
    throw new MidwayCommonError('swagger-ui-dist is not installed');
  }

  function replaceInfo(content: string): string {
    let str = `location.href.replace('${this.swaggerConfig.swaggerPath}/index.html', '${this.swaggerConfig.swaggerPath}/index.json'),\n validatorUrl: null,`;
    if (this.swaggerConfig.displayOptions) {
      Object.keys(this.swaggerConfig.displayOptions).forEach(key => {
        str += `\n${key}: ${this.swaggerConfig.displayOptions[key]},`;
      });
    }
    return content.replace(
      '"https://petstore.swagger.io/v2/swagger.json",',
      str
    );
  }

  const swaggerUiAssetPath = getAbsoluteFSPath();

  return async (pathname: string) => {
    if (
      !swaggerUiAssetPath ||
      pathname.indexOf(swaggerConfig.swaggerPath) === -1
    ) {
      return;
    }

    const arr = pathname.split('/');
    let lastName = arr.pop();
    if (lastName === 'index.json') {
      return { ext: 'json', content: this.swaggerExplorer.getData() };
    }
    if (!lastName) {
      lastName = 'index.html';
    }

    let content: Buffer | string = readFileSync(
      join(swaggerUiAssetPath, lastName)
    );
    if (lastName === 'index.html' || lastName === 'swagger-initializer.js') {
      content = content.toString('utf8');
      content = replaceInfo(content);
    }
    const ext = extname(lastName);
    return { ext, content };
  };
}

export function renderJSON(swaggerConfig: SwaggerOptions) {
  return async (pathname: string) => {
    if (pathname.indexOf(swaggerConfig.swaggerPath) === -1) {
      return;
    }
    if (pathname === 'index.json') {
      return { ext: 'json', content: this.swaggerExplorer.getData() };
    }
    return;
  };
}
