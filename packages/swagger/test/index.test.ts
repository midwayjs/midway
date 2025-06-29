import { close, createLegacyApp, createHttpRequest, createLightApp } from '@midwayjs/mock';
import * as koa from '@midwayjs/koa';
import { join } from 'path';
import { MidwayWebRouterService } from '@midwayjs/core';
import * as SwaggerParser from "@apidevtools/swagger-parser";
import * as swagger from '../src';

describe('/test/index.test.ts', () => {
  describe('test swagger', () => {
    let app;
    beforeAll(async () => {
      try {
        app = await createLegacyApp(
          join(__dirname, 'fixtures/cats'),
          {
            globalConfig: {
              swagger: {
                documentOptions: {
                  operationIdFactory: (c, r) =>
                    `${c.replace('Controller', '')}_${r.method}`.toLowerCase(),
                },
              },
            },
            imports: [koa],
          },
        );
      } catch (e) {
        console.log(e);
        console.log('beforeAll: ' + e.stack);
      }
    });

    afterAll(async () => {
      await close(app);
    });

    it('should get swagger json', async () => {
      let ret = await createHttpRequest(app).get('/swagger-ui/index.html');
      expect(ret.type).toEqual('text/html');
      expect(ret.text).toContain('html');

      ret = await createHttpRequest(app).get('/swagger-ui/swagger-ui.js');
      expect(ret.type).toEqual('application/javascript');
      expect(ret.text).toContain('!function');

      ret = await createHttpRequest(app).get('/swagger-ui/swagger-ui.css');
      expect(ret.type).toEqual('text/css');
      expect(ret.text).toContain('.swagger-ui{color:#3b4151');

      const result = await createHttpRequest(app).get('/swagger-ui/index.json');
      expect(result.type).toEqual('application/json');
      const body = result.body;
      console.log('--->', JSON.stringify(body));

      expect(body.tags.length).toBeGreaterThanOrEqual(2);
      expect(body.tags).toStrictEqual([
        { name: '1-你好这里', description: '' },
        { name: '2-国家测试', description: '' },
        { description: '', name: 'sss' },
      ]);
      expect(body.components.securitySchemes).toStrictEqual({
        bbb: { type: 'http', scheme: 'basic' },
        ttt: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      });
      expect(body.components.schemas.CatT).toMatchSnapshot();
      expect(body.components.schemas.Catd).toMatchSnapshot();
      expect(body.components.schemas.Cata).toMatchSnapshot();
      expect(body.components.schemas.Cat).toMatchSnapshot();
      expect(body.components.schemas.CreateCatDto).toMatchSnapshot();

      const selfSchema = {
        items: {
          $ref: '#/components/schemas/Cat',
        },
        type: 'array',
      };
      expect(body.components.schemas.Cat.properties.children).toEqual(
        selfSchema
      );

      expect(body.components.schemas.Cat.properties.childrenWithRef).toEqual(
        selfSchema
      );
      expect(body.components.schemas.Cat.properties.mother).toEqual({
        $ref: '#/components/schemas/Cat',
      });
      expect(body.components.schemas.Cat.properties.father).toEqual({
        $ref: '#/components/schemas/Cat',
      });
      expect(body.paths['/helloworld/vvvv01/cats/{id}']).toMatchSnapshot();
    });
  });

  it('should fix issue1976', async () => {
    const app = await createLegacyApp(join(__dirname, 'fixtures/issue1976'), {});
    const result = await createHttpRequest(app).get('/swagger-ui/index.json');
    expect(result.type).toEqual('application/json');
    const body = result.body;
    expect(body).toMatchSnapshot();
    console.log(JSON.stringify(body));

    const result1 = await createHttpRequest(app).get('/swagger-ui/index.html');
    expect(result1.type).toEqual('text/html');
    expect(result1.text).toMatch(/html/);
    await close(app);
  });

  it('should fix issue2603', async () => {
    const app = await createLegacyApp(join(__dirname, 'fixtures/issue2603'), {});
    const result = await createHttpRequest(app).get('/swagger-ui/index.json');
    expect(result.type).toEqual('application/json');
    const body = result.body;
    expect(body).toMatchSnapshot();
    console.log(JSON.stringify(body));
    await close(app);
  });

  describe('test auth type with security', () => {
    it('should test basic auth', async () => {
      const app = await createLightApp({
        imports: [koa, swagger],
        globalConfig: {
          keys: 'testKeys',
          swagger: {
            auth: {
              name: 'basicAuth',
              authType: 'basic',
              description: 'basic auth',
            }
          },
        },
      });

      const webRouterService = await app.getApplicationContext().getAsync(MidwayWebRouterService);
      webRouterService.addRouter(async ctx => {
        return 'hello world';
      }, {
        url: '/test',
        requestMethod: 'GET',
      });

      const result = await createHttpRequest(app).get('/swagger-ui/index.json');

      await SwaggerParser.validate(result.body, {
        parse: {
          json: true
        }
      });
      expect(JSON.stringify(result.body)).toMatch(/basicAuth/);

      await close(app);
    });

    it('should test bearer auth', async () => {
      const app = await createLightApp({
        imports: [koa, swagger],
        globalConfig: {
          keys: 'testKeys',
          swagger: {
            auth: {
              name: 'bearerAuth',
              authType: 'bearer',
              description: 'bearer auth',
            }
          },
        },
      });

      const webRouterService = await app.getApplicationContext().getAsync(MidwayWebRouterService);
      webRouterService.addRouter(async ctx => {
        return 'hello world';
      }, {
        url: '/test',
        requestMethod: 'GET',
      });

      const result = await createHttpRequest(app).get('/swagger-ui/index.json');
      await SwaggerParser.validate(result.body, {
        parse: {
          json: true
        }
      });
      expect(JSON.stringify(result.body)).toMatch(/bearerAuth/);

      await close(app);
    });

    it('should test apiKey auth', async () => {
      const app = await createLightApp({
        imports: [koa, swagger],
        globalConfig: {
          keys: 'testKeys',
          swagger: {
            auth: {
              name: 'apiKeyAuth',
              authType: 'apikey',
              description: 'apiKey auth',
              in: 'header',
            }
          },
        },
      });

      const webRouterService = await app.getApplicationContext().getAsync(MidwayWebRouterService);
      webRouterService.addRouter(async ctx => {
        return 'hello world';
      }, {
        url: '/test',
        requestMethod: 'GET',
      });

      const result = await createHttpRequest(app).get('/swagger-ui/index.json');
      await SwaggerParser.validate(result.body, {
        parse: {
          json: true
        }
      });
      expect(JSON.stringify(result.body)).toMatch(/apiKeyAuth/);

      await close(app);
    });

    it('should test cookie auth', async () => {
      const app = await createLightApp({
        imports: [koa, swagger],
        globalConfig: {
          keys: 'testKeys',
          swagger: {
            auth: {
              authType: 'cookie',
              cookieName: 'myCookie',
              securityName: 'cookieAuth',
              description: 'cookie auth',
            }
          },
        },
      });

      const webRouterService = await app.getApplicationContext().getAsync(MidwayWebRouterService);
      webRouterService.addRouter(async ctx => {
        return 'hello world';
      }, {
        url: '/test',
        requestMethod: 'GET',
      });

      const result = await createHttpRequest(app).get('/swagger-ui/index.json');

      // 校验 cookieAuth 的结构
      const securitySchemes = result.body.components.securitySchemes;
      expect(securitySchemes.cookieAuth).toBeDefined();
      expect(securitySchemes.cookieAuth.type).toBe('apiKey');
      expect(securitySchemes.cookieAuth.in).toBe('cookie');
      await SwaggerParser.validate(result.body, {
        parse: {
          json: true
        }
      });
      expect(JSON.stringify(result.body)).toMatch(/cookieAuth/);

      await close(app);
    });

    it('should test oauth2 auth', async () => {
      const app = await createLightApp({
        imports: [koa, swagger],
        globalConfig: {
          keys: 'testKeys',
          swagger: {
            auth: {
              name: 'oauth2Auth',
              authType: 'oauth2',
              description: 'oauth2 auth',
              flows: {
                authorizationCode: {
                  authorizationUrl: 'https://example.com/auth',
                  tokenUrl: 'https://example.com/token',
                  scopes: {
                    'read': 'Read access',
                    'write': 'Write access'
                  }
                }
              }
            }
          },
        },
      });

      const webRouterService = await app.getApplicationContext().getAsync(MidwayWebRouterService);
      webRouterService.addRouter(async ctx => {
        return 'hello world';
      }, {
        url: '/test',
        requestMethod: 'GET',
      });

      const result = await createHttpRequest(app).get('/swagger-ui/index.json');

      // 校验 oauth2Auth 的结构
      const securitySchemes = result.body.components.securitySchemes;
      expect(securitySchemes.oauth2Auth).toBeDefined();
      expect(securitySchemes.oauth2Auth.type).toBe('oauth2');
      expect(securitySchemes.oauth2Auth.flows).toBeDefined();
      expect(securitySchemes.oauth2Auth.flows.authorizationCode).toBeDefined();
      expect(securitySchemes.oauth2Auth.flows.authorizationCode.authorizationUrl).toBe('https://example.com/auth');
      expect(securitySchemes.oauth2Auth.flows.authorizationCode.tokenUrl).toBe('https://example.com/token');
      expect(securitySchemes.oauth2Auth.flows.authorizationCode.scopes).toBeDefined();
      expect(securitySchemes.oauth2Auth.flows.authorizationCode.scopes.read).toBe('Read access');
      expect(securitySchemes.oauth2Auth.flows.authorizationCode.scopes.write).toBe('Write access');
      await SwaggerParser.validate(result.body, {
        parse: {
          json: true
        }
      });
      expect(JSON.stringify(result.body)).toMatch(/oauth2Auth/);

      await close(app);
    });

    it('should test custom auth', async () => {
      const app = await createLightApp({
        imports: [koa, swagger],
        globalConfig: {
          keys: 'testKeys',
          swagger: {
            auth: {
              name: 'customAuth',
              authType: 'custom',
              type: 'http',
              scheme: 'custom',
              description: 'custom auth',
            }
          },
        },
      });

      const webRouterService = await app.getApplicationContext().getAsync(MidwayWebRouterService);
      webRouterService.addRouter(async ctx => {
        return 'hello world';
      }, {
        url: '/test',
        requestMethod: 'GET',
      });

      const result = await createHttpRequest(app).get('/swagger-ui/index.json');
      await SwaggerParser.validate(result.body, {
        parse: {
          json: true
        }
      });
      expect(JSON.stringify(result.body)).toMatch(/customAuth/);

      await close(app);
    });

    it('should test addSecurityRequirements config', async () => {
      const app = await createLightApp({
        imports: [koa, swagger],
        globalConfig: {
          keys: 'testKeys',
          swagger: {
            auth: {
              name: 'basicAuth',
              authType: 'basic',
              description: 'basic auth',
              addSecurityRequirements: true,
            }
          },
        },
      });

      const webRouterService = await app.getApplicationContext().getAsync(MidwayWebRouterService);
      webRouterService.addRouter(async ctx => {
        return 'hello world';
      }, {
        url: '/test',
        requestMethod: 'GET',
      });

      const result = await createHttpRequest(app).get('/swagger-ui/index.json');
      // 校验全局 security 字段
      expect(result.body.security).toBeDefined();
      expect(Array.isArray(result.body.security)).toBe(true);
      expect(result.body.security.some(item => Object.keys(item).includes('basicAuth'))).toBe(true);
      // 校验 paths 下的接口 method 没有单独的 security 字段
      Object.values(result.body.paths).forEach(pathItem => {
        Object.values(pathItem).forEach(methodItem => {
          expect(methodItem.security).toBeUndefined();
        });
      });
      await SwaggerParser.validate(result.body, {
        parse: {
          json: true
        }
      });
      expect(JSON.stringify(result.body)).toMatch(/basicAuth/);

      await close(app);
    });
  });
});
