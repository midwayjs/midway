import { SwaggerOptions } from '../interfaces';
import { safeRequire } from '@midwayjs/core';
import { renderJSON, renderSwaggerUI } from '../ui';
const { getAbsoluteFSPath } = safeRequire('swagger-ui-dist');
export const swagger: SwaggerOptions = {
  title: 'My Project',
  description: 'This is a swagger-ui for midwayjs project',
  version: '1.0.0',
  swaggerPath: '/swagger-ui',
  swaggerRender: getAbsoluteFSPath ? renderSwaggerUI : renderJSON,
};
