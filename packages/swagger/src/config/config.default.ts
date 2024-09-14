import { SwaggerOptions } from '../interfaces';
import { renderSwaggerUIRemote, renderSwaggerUIDist } from '../ui/render';
import { safeRequire } from '@midwayjs/core';
const swaggerDist = safeRequire('swagger-ui-dist');

export const swagger: SwaggerOptions = {
  title: 'My Project',
  description: 'This is a swagger-ui for midwayjs project',
  version: '1.0.0',
  swaggerPath: '/swagger-ui',
  swaggerUIRender:
    swaggerDist && swaggerDist.getAbsoluteFSPath
      ? renderSwaggerUIDist
      : renderSwaggerUIRemote,
  swaggerUIRenderOptions: {},
  isGenerateTagForController: true,
};
