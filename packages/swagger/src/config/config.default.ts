import { SwaggerOptions } from '../interfaces';
import { renderSwaggerUIRemote } from '../ui/render';
export const swagger: SwaggerOptions = {
  title: 'My Project',
  description: 'This is a swagger-ui for midwayjs project',
  version: '1.0.0',
  swaggerPath: '/swagger-ui',
  swaggerUIRender: renderSwaggerUIRemote,
  swaggerUIRenderOptions: {},
};
