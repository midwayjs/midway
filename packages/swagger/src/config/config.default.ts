import { SwaggerOptions } from '../interfaces';
import { renderSwaggerUIRemote, renderSwaggerUIDist } from '../ui/render';
import { safeRequire } from '@midwayjs/core';
const { getAbsoluteFSPath } = safeRequire('swagger-ui-dist');

export const swagger: SwaggerOptions = {
  title: 'My Project',
  description: 'This is a swagger-ui for midwayjs project',
  version: '1.0.0',
  swaggerPath: '/swagger-ui',
  swaggerUIRender: getAbsoluteFSPath
    ? renderSwaggerUIDist
    : renderSwaggerUIRemote,
  swaggerUIRenderOptions: {},
};
