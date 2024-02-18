import {
  MidwayCommonError,
  MidwayInvalidConfigPropertyError,
  safeRequire,
} from '@midwayjs/core';
import type { SwaggerOptions } from '../interfaces';
import { readFileSync } from 'fs';
import { extname, join, isAbsolute } from 'path';
import { SwaggerExplorer } from '../swaggerExplorer';

export function renderSwaggerUIDist(
  swaggerConfig: SwaggerOptions,
  swaggerExplorer: SwaggerExplorer
) {
  const { getAbsoluteFSPath } = safeRequire('swagger-ui-dist');
  if (!getAbsoluteFSPath) {
    throw new MidwayCommonError('swagger-ui-dist is not installed');
  }

  const swaggerRenderOptions = swaggerConfig.swaggerUIRenderOptions || {};
  if (swaggerRenderOptions.customInitializer) {
    if (isAbsolute(swaggerRenderOptions.customInitializer as string)) {
      swaggerRenderOptions.customInitializer = readFileSync(
        swaggerRenderOptions.customInitializer as string
      );
    } else {
      throw new MidwayInvalidConfigPropertyError(
        'swagger.swaggerRenderOptions.customInitializer',
        ['Buffer', 'String']
      );
    }
  }

  function replaceInfo(content: string): string {
    let str = `location.href.replace('${swaggerConfig.swaggerPath}/index.html', '${swaggerConfig.swaggerPath}/index.json'),\n validatorUrl: null,`;
    if (swaggerConfig.displayOptions) {
      Object.keys(swaggerConfig.displayOptions).forEach(key => {
        str += `\n${key}: ${swaggerConfig.displayOptions[key]},`;
      });
    }
    return content.replace(
      '"https://petstore.swagger.io/v2/swagger.json",',
      str
    );
  }

  const swaggerUiAssetPath = getAbsoluteFSPath();

  return async (pathname: string): Promise<{ ext: string; content: any }> => {
    if (
      !swaggerUiAssetPath ||
      pathname.indexOf(swaggerConfig.swaggerPath) === -1
    ) {
      return;
    }

    const arr = pathname.split('/');
    let lastName = arr.pop();
    if (lastName === 'index.json') {
      return { ext: 'json', content: swaggerExplorer.getData() };
    }
    if (!lastName) {
      lastName = 'index.html';
    }

    let content: Buffer | string = readFileSync(
      join(swaggerUiAssetPath, lastName)
    );

    if (
      lastName === 'swagger-initializer.js' &&
      swaggerRenderOptions?.customInitializer
    ) {
      return { ext: 'js', content: swaggerRenderOptions.customInitializer };
    }

    if (lastName === 'index.html' || lastName === 'swagger-initializer.js') {
      content = content.toString('utf8');
      content = replaceInfo(content);
    }
    const ext = extname(lastName);
    return { ext, content };
  };
}

export function renderJSON(
  swaggerConfig: SwaggerOptions,
  swaggerExplorer: SwaggerExplorer
) {
  return async (pathname: string) => {
    if (pathname.indexOf(swaggerConfig.swaggerPath) === -1) {
      return;
    }
    const arr = pathname.split('/');
    const lastName = arr.pop();
    if (lastName === 'index.json') {
      return { ext: 'json', content: swaggerExplorer.getData() };
    }
    return;
  };
}

export function renderSwaggerUIRemote(
  swaggerConfig: SwaggerOptions,
  swaggerExplorer: SwaggerExplorer
) {
  const swaggerRenderOptions = swaggerConfig.swaggerUIRenderOptions || {};
  const indexPagePath =
    swaggerRenderOptions?.indexPagePath || join(__dirname, '../../index.html');
  return async (pathname: string) => {
    if (pathname.indexOf(swaggerConfig.swaggerPath) === -1) {
      return;
    }

    const arr = pathname.split('/');
    let lastName = arr.pop();
    if (lastName === 'index.json') {
      return { ext: 'json', content: swaggerExplorer.getData() };
    }
    if (!lastName) {
      lastName = 'index.html';
    }

    if (lastName === 'index.html') {
      const content = readFileSync(indexPagePath, 'utf8');
      return { ext: 'html', content };
    }
    return;
  };
}
