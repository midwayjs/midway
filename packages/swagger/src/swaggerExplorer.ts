import {
  Config,
  CONTROLLER_KEY,
  listModule,
  Provide,
  ControllerOption,
  getClassMetadata,
  getMethodParamTypes,
  getPropertyDataFromClass,
  isClass,
  RouteParamTypes,
  RouterOption,
  RouterParamValue,
  WEB_ROUTER_KEY,
  WEB_ROUTER_PARAM_KEY,
  Init,
} from '@midwayjs/decorator';
import { PathItemObject, Type } from './interfaces';
import { DECORATORS } from './constants';
import { DocumentBuilder } from './documentBuilder';

@Provide()
export class SwaggerExplorer {
  @Config('swagger')
  private swaggerConfig: any;

  private documentBuilder = new DocumentBuilder();

  @Init()
  async init() {
    this.documentBuilder.setTitle(this.swaggerConfig.title);
    this.documentBuilder.setVersion(this.swaggerConfig.version);
    this.documentBuilder.setDescription(this.swaggerConfig.description);
    if (this.swaggerConfig?.contact && typeof this.swaggerConfig?.contact === 'object') {
      this.documentBuilder.setContact(this.swaggerConfig?.contact?.name,
        this.swaggerConfig?.contact?.url,
        this.swaggerConfig?.contact?.email);
    }
    if (this.swaggerConfig?.license && typeof this.swaggerConfig?.license === 'object') {
      this.documentBuilder.setLicense(this.swaggerConfig?.license?.name,
        this.swaggerConfig?.license?.url);
    }
    if (this.swaggerConfig.basePath) {
      this.documentBuilder.setBasePath(this.swaggerConfig.basePath);
    }
    if (this.swaggerConfig.termsOfService) {
      this.documentBuilder.setTermsOfService(this.swaggerConfig.termsOfService);
    }
    if (this.swaggerConfig?.externalDoc && typeof this.swaggerConfig?.externalDoc === 'object') {
      this.documentBuilder.setExternalDoc(this.swaggerConfig?.externalDoc?.description,
        this.swaggerConfig?.externalDoc?.url)
    }
    if (this.swaggerConfig?.servers && Array.isArray(this.swaggerConfig?.servers)) {
      for (const serv of this.swaggerConfig?.servers) {
        this.documentBuilder.addServer(serv?.url, serv?.description);
      }
    }
    if (this.swaggerConfig?.tags && Array.isArray(this.swaggerConfig?.tags)) {
      for (const t of this.swaggerConfig?.tags) {
        this.documentBuilder.addTag(t.name, t.description, t.externalDocs);
      }
    }
    // 设置 auth 类型
    this.setAuth(this.swaggerConfig?.auth);
  }

  public scanApp() {
    const routes = listModule(CONTROLLER_KEY);

    for (const route of routes) {
      this.generatePath(route);
    }
  }

  public getData() {
    return this.documentBuilder.build();
  }

  private generatePath(module: Type) {
    const ex = Reflect.getMetadata(DECORATORS.API_EXCLUDE_CONTROLLER, module);
    // exclude controller
    if (Array.isArray(ex) && ex[0]) {
      return;
    }
    const controllerOption: ControllerOption = getClassMetadata(
      CONTROLLER_KEY,
      module
    );

    const prefix = controllerOption.prefix;
    const tag = { name: '', description: '' };
    if (prefix !== '/') {
      tag.name =
        controllerOption?.routerOptions.tagName ||
        (/^\//.test(prefix) ? prefix.split('/')[1] : prefix);
      tag.description = controllerOption?.routerOptions.description || tag.name;
    } else {
      tag.name = controllerOption?.routerOptions.tagName || 'default';
      tag.description = controllerOption?.routerOptions.description || tag.name;
    }
    if (tag.name) {
      this.documentBuilder.addTag(tag.name, tag.description);
    }
    const tags = Reflect.getMetadata(DECORATORS.API_TAGS, module);
    if (Array.isArray(tags)) {
      for (const t of tags) {
        this.documentBuilder.addTag(t);
      }
    }

    // const globalMiddleware = controllerOption.routerOptions.middleware;
    // get router info
    const webRouterInfo: RouterOption[] = getClassMetadata(
      WEB_ROUTER_KEY,
      module
    );
    
    const paths: Record<string, PathItemObject> = {};
    if (webRouterInfo && typeof webRouterInfo[Symbol.iterator] === 'function') {
      for (const webRouter of webRouterInfo) {
        let url = (prefix + webRouter.path).replace('//', '/');
        url = replaceUrl(url, parseParamsInPath(url));

        this.generateRouteMethod(url, webRouter, module, paths);
      }
    }

    this.documentBuilder.addPaths(paths);
  }
  /**
   * 构造 router 提取方法
   * @param url 
   * @param webRouter 
   * @param module 
   * @param paths 
   */
  private generateRouteMethod(url: string,
    webRouter: RouterOption,
    module: any,
    paths: Record<string, PathItemObject>) {

    const operMeta = Reflect.getMetadata(DECORATORS.API_OPERATION,
      module,
      webRouter.method);

    const opts: PathItemObject = {};
    if (!paths[url]) {
      paths[url] = opts;
    }
    const parameters = [];
    opts[webRouter.requestMethod] = {
      summary: operMeta.summary,
      description: operMeta.description,
      operationId: operMeta.operationId || webRouter.method,
      tags: operMeta.tags || [],
    };

    const args: RouterParamValue[] = getPropertyDataFromClass(WEB_ROUTER_PARAM_KEY, module, webRouter.method);
    const types = getMethodParamTypes(module, webRouter.method);
    const params = Reflect.getMetadata(DECORATORS.API_PARAMETERS,
      module,
      webRouter.method);

    for (const arg of args) {
      const p: any = {
        name: arg.propertyData,
        in: convertTypeToString(arg.type),
        required: false,
      };

      this.parseFromParamsToP(params, p);

      if (p.in === 'path') {
        p.required = true;

        if (url.indexOf('{' + p.name + '}') === -1) {
          continue;
        }
      }
      if (!p.schema) {
        if (isClass(types[arg.index])) {
          p.schema = {
            $ref: '#/components/schemas/' + types[arg.index].name,
          };
        } else {
          p.schema = {
            type: convertSchemaType(types[arg.index]),
          };
        }
      }

      if (p.in === 'body') {
        const requestBody = {
          required: true,
          description: p.description || p.name,
          content: p.content || {
            'application/json': {
              schema: p.schema,
            },
          },
        };
        opts[webRouter.requestMethod].requestBody = requestBody;

        delete p.content;
      }

      parameters.push(p);
    }

    opts[webRouter.requestMethod].parameters = parameters;
    opts[webRouter.requestMethod].responses = {};

    const responses = Reflect.getMetadata(DECORATORS.API_RESPONSE, module, webRouter.method);
    for (const resp of responses) {
      // 这里是引用，赋值可以直接更改
      const tt = resp[Object.keys(resp)[0]];
      if (isClass(tt.type)) {
        tt.schema = {
          $ref: '#/components/schemas/' + tt.type.name,
        };
      }
      if (tt.isArray) {
        tt.schema = {
          type: 'array',
          items: {
            type: tt?.schema?.$ref ?? convertSchemaType(tt.type),
            format: tt.format,
          }
        };
      } else {
        if (!tt.schema) {
          tt.schema = {
            type: convertSchemaType(tt.type),
            format: tt.format,
          };
        }
      }
      delete tt.type;
      delete tt.isArray;
      delete tt.format;

      Object.assign(opts[webRouter.requestMethod].responses, resp);
    }

    paths[url] = opts;
  }
  /**
   * 提取参数
   * @param params 
   * @param p 
   */
  private parseFromParamsToP(params: any, p: any) {
    if (Array.isArray(params)) {
      const param = params.filter(item => item.name === p.name)[0];

      if (param) {
        p.description = param.description;
        p.allowEmptyValue = param.allowEmptyValue || false;
        p.example = param.example;
        p.examples = param.examples;
        p.deprecated = param.deprecated || false;
        p.in = param?.in ?? p.in;
        p.required = param?.required ?? p.required;
        p.allowReserved = param?.allowReserved ?? false;
        p.explode = param?.explode ?? false;
        p.style = param?.style ?? false;
        // response content
        p.content = param?.content ?? null;
        if (param.schema) {
          p.schema = param.schema;
        } else {
          if (param.type) {
            if (isClass(param.type)) {
              p.schema = {
                $ref: '#/components/schemas/' + param.type.name,
              };  
            }

            if (param.isArray) {
              p.schema = {
                type: 'array',
                items: {
                  type: p?.schema?.$ref ?? convertSchemaType(param.type),
                  format: param.format
                }
              };
            } else {
              if (!p.schema) {
                p.schema = {
                  type: convertSchemaType(param.type),
                  format: param.format
                };
              }
            }
          }
        }
      }
    }
  }
  /**
   * 授权验证
   * @param opts 
   * @returns 
   */
  private setAuth(opts: any) {
    if (!opts) {
      return;
    }
    const authType = opts.authType;
    delete opts.authType;

    switch(authType) {
      case 'basic':
        this.documentBuilder.addBasicAuth();
        break;
      case 'bearer':
        this.documentBuilder.addBearerAuth();
        break;
      case 'cookie':
        this.documentBuilder.addCookieAuth();
        break;
      case 'oauth2':
        this.documentBuilder.addOAuth2()
        break;
      case 'apikey':
        this.documentBuilder.addApiKey();
        break;
      case 'custom':
        this.documentBuilder.addSecurity(opts?.name, opts);
        break;
    }
  }
}
/**
 * 解释路由上的参数
 * @param url
 */
 function parseParamsInPath(url: string) {
  const names: string[] = [];
  url.split('/').forEach(item => {
    if (item.startsWith(':')) {
      const paramName = item.substr(1);
      names.push(paramName);
    }
  });
  return names;
}
/**
 * 替换成 openapi 的url
 * @param url
 * @param names
 */
 function replaceUrl(url: string, names: string[]) {
  names.forEach(n => {
    url = url.replace(`:${n}`, `{${n}}`);
  });
  return url;
}

function convertTypeToString(type: RouteParamTypes) {
  switch (type) {
    case RouteParamTypes.HEADERS:
      return 'header';
    case RouteParamTypes.QUERY:
      return 'query';
    case RouteParamTypes.PARAM:
      return 'path';
    case RouteParamTypes.BODY:
      return 'body';
    default:
      return 'header';
  }
}

function convertSchemaType(value) {
  switch (value) {
    case 'Object':
      return 'object';
    case 'Boolean':
      return 'boolean';
    case 'Number':
      return 'number';
    case 'String':
      return 'string';
    default:
      return 'object';
  }
}