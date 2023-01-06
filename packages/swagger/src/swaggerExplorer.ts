import {
  Config,
  CONTROLLER_KEY,
  listModule,
  Provide,
  ControllerOption,
  getClassMetadata,
  getMethodParamTypes,
  Types,
  RouteParamTypes,
  RouterOption,
  WEB_ROUTER_KEY,
  WEB_ROUTER_PARAM_KEY,
  Init,
  Scope,
  ScopeEnum,
  INJECT_CUSTOM_PROPERTY,
  INJECT_CUSTOM_PARAM,
  INJECT_CUSTOM_METHOD,
  getPropertyType,
  RequestMethod,
  getClassExtendedMetadata,
} from '@midwayjs/core';
import { PathItemObject, Type } from './interfaces';
import { DECORATORS } from './constants';
import { DocumentBuilder } from './documentBuilder';
import {
  SwaggerOptions,
  AuthOptions,
  SecuritySchemeObject,
} from './interfaces/';
import { BodyContentType } from '.';

@Provide()
@Scope(ScopeEnum.Singleton)
export class SwaggerExplorer {
  @Config('swagger')
  private swaggerConfig: SwaggerOptions;

  private documentBuilder = new DocumentBuilder();

  @Init()
  async init() {
    this.documentBuilder.setTitle(this.swaggerConfig.title);
    this.documentBuilder.setVersion(this.swaggerConfig.version);
    this.documentBuilder.setDescription(this.swaggerConfig.description);
    if (
      this.swaggerConfig?.contact &&
      typeof this.swaggerConfig?.contact === 'object'
    ) {
      this.documentBuilder.setContact(
        this.swaggerConfig?.contact?.name,
        this.swaggerConfig?.contact?.url,
        this.swaggerConfig?.contact?.email
      );
    }
    if (
      this.swaggerConfig?.license &&
      typeof this.swaggerConfig?.license === 'object'
    ) {
      this.documentBuilder.setLicense(
        this.swaggerConfig?.license?.name,
        this.swaggerConfig?.license?.url
      );
    }
    if (this.swaggerConfig.termsOfService) {
      this.documentBuilder.setTermsOfService(this.swaggerConfig.termsOfService);
    }
    if (
      this.swaggerConfig?.externalDocs &&
      typeof this.swaggerConfig?.externalDocs === 'object'
    ) {
      this.documentBuilder.setExternalDoc(
        this.swaggerConfig?.externalDocs?.description,
        this.swaggerConfig?.externalDocs?.url
      );
    }
    if (
      this.swaggerConfig?.servers &&
      Array.isArray(this.swaggerConfig?.servers)
    ) {
      for (const serv of this.swaggerConfig?.servers) {
        this.documentBuilder.addServer(
          serv?.url,
          serv?.description,
          serv?.variables
        );
      }
    }
    if (this.swaggerConfig?.tags && Array.isArray(this.swaggerConfig?.tags)) {
      for (const t of this.swaggerConfig?.tags) {
        this.documentBuilder.addTag(t.name, t.description, t.externalDocs);
      }
    }
    // 设置 auth 类型
    if (Array.isArray(this.swaggerConfig?.auth)) {
      for (const a of this.swaggerConfig?.auth) {
        this.setAuth(a);
      }
    } else {
      this.setAuth(this.swaggerConfig?.auth);
    }
  }

  public addGlobalPrefix(prefix: string) {
    if (!prefix) {
      return;
    }
    this.documentBuilder.addServer(prefix);
  }

  public scanApp() {
    const routes = listModule(CONTROLLER_KEY);

    for (const route of routes) {
      this.generatePath(route);
    }

    if (this.swaggerConfig?.tagSortable) {
      this.documentBuilder.sortTags();
    }
  }

  public getData() {
    return this.documentBuilder.build();
  }

  protected generatePath(target: Type) {
    this.parseExtraModel(target);

    const metaForMethods: any[] =
      getClassMetadata(INJECT_CUSTOM_METHOD, target) || [];
    const exs = metaForMethods.filter(
      item => item.key === DECORATORS.API_EXCLUDE_CONTROLLER
    );
    if (exs[0]) {
      return;
    }

    const metaForParams: any[] =
      getClassMetadata(INJECT_CUSTOM_PARAM, target) || [];

    const controllerOption: ControllerOption = getClassMetadata(
      CONTROLLER_KEY,
      target
    );

    const prefix = controllerOption.prefix;
    const tags = metaForMethods.filter(
      item => item.key === DECORATORS.API_TAGS
    );
    let strTags: string[] = [];
    if (tags.length > 0) {
      for (const t of tags) {
        // 这里 metadata => string[]
        strTags = strTags.concat(t.metadata);
        this.documentBuilder.addTag(t.metadata);
      }
    } else {
      const tag = { name: '', description: '' };
      if (prefix !== '/') {
        tag.name =
          controllerOption?.routerOptions.tagName ||
          (/^\//.test(prefix) ? prefix.split('/')[1] : prefix);
        tag.description =
          controllerOption?.routerOptions.description || tag.name;
      } else {
        tag.name = controllerOption?.routerOptions.tagName;
        tag.description =
          controllerOption?.routerOptions.description || tag.name;
      }
      if (tag.name) {
        strTags.push(tag.name);
        this.documentBuilder.addTag(tag.name, tag.description);
      }
    }

    // const globalMiddleware = controllerOption.routerOptions.middleware;
    // get router info
    const webRouterInfo: RouterOption[] = getClassMetadata(
      WEB_ROUTER_KEY,
      target
    );

    let header = null;
    const headers = metaForMethods.filter(
      item => item.key === DECORATORS.API_HEADERS
    );
    if (headers.length > 0) {
      header = headers[0].metadata;
    }

    const security = metaForMethods.filter(
      item => item.key === DECORATORS.API_SECURITY
    );

    const paths: Record<string, PathItemObject> = {};
    if (webRouterInfo && typeof webRouterInfo[Symbol.iterator] === 'function') {
      for (const webRouter of webRouterInfo) {
        let url = (prefix + webRouter.path).replace('//', '/');
        url = replaceUrl(url, parseParamsInPath(url));

        // 判断是否忽略当前路由
        const endpoints = metaForMethods.filter(
          item =>
            item.key === DECORATORS.API_EXCLUDE_ENDPOINT &&
            item.propertyName === webRouter.method
        );
        if (endpoints[0]) {
          continue;
        }

        const routerArgs = metaForParams[webRouter.method] || [];
        const bds = routerArgs.filter(
          item =>
            item.key === WEB_ROUTER_PARAM_KEY &&
            item?.metadata?.type === RouteParamTypes.BODY
        );
        if (bds.length > 1) {
          // swagger not support more than one @Body
          continue;
        }

        this.generateRouteMethod(
          url,
          webRouter,
          paths,
          metaForMethods,
          routerArgs,
          header,
          target
        );

        // 这里赋值 tags
        if (paths[url][webRouter.requestMethod].tags.length === 0) {
          paths[url][webRouter.requestMethod].tags = strTags;
        }
        // extension => prefix 为 x-
        const exts = metaForMethods.filter(
          item =>
            item.key === DECORATORS.API_EXTENSION &&
            item.propertyName === webRouter.method
        );
        for (const e of exts) {
          if (e.metadata) {
            Object.assign(paths[url][webRouter.requestMethod], e.metadata);
          }
        }

        if (security.length > 0) {
          if (!paths[url][webRouter.requestMethod].security) {
            paths[url][webRouter.requestMethod].security = [];
          }

          for (const s of security) {
            if (!s.metadata) {
              continue;
            }
            paths[url][webRouter.requestMethod].security.push(s.metadata);
          }
        }
      }
    }

    this.documentBuilder.addPaths(paths);
  }
  /**
   * 构造 router 提取方法
   */
  private generateRouteMethod(
    url: string,
    webRouter: RouterOption,
    paths: Record<string, PathItemObject>,
    metaForMethods: any[],
    routerArgs: any[],
    header: any,
    target: Type
  ) {
    const operMeta = metaForMethods.filter(
      item =>
        item.key === DECORATORS.API_OPERATION &&
        item.propertyName === webRouter.method
    )[0];

    let opts: PathItemObject = paths[url];
    if (!opts) {
      opts = {};
    }
    const parameters = [];
    opts[webRouter.requestMethod] = {
      summary: getNotEmptyValue(operMeta?.metadata?.summary, webRouter.summary),
      description: getNotEmptyValue(
        operMeta?.metadata?.description,
        webRouter.description
      ),
      // operationId: `${webRouter.requestMethod}_${(operMeta?.metadata?.operationId || webRouter.method)}`,
      tags: operMeta?.metadata?.tags || [],
    };
    /**
     * [{"key":"web:router_param","parameterIndex":1,"propertyName":"create","metadata":{"type":2}},
     * {"key":"web:router_param","parameterIndex":0,"propertyName":"create","metadata":{"type":1,"propertyData":"createCatDto"}}]
     */
    // WEB_ROUTER_PARAM_KEY
    const args: any[] = routerArgs.filter(
      item => item.key === WEB_ROUTER_PARAM_KEY
    );
    const types = getMethodParamTypes(target, webRouter.method);
    const params = metaForMethods.filter(
      item =>
        item.key === DECORATORS.API_PARAMETERS &&
        item.propertyName === webRouter.method
    );

    for (const arg of args) {
      const currentType = types[arg.parameterIndex];
      const p: any = {
        name: arg?.metadata?.propertyData ?? '',
        in: convertTypeToString(arg.metadata?.type),
        required: false,
      };

      if (p.in === 'path') {
        p.required = true;

        if (url.indexOf('{' + p.name + '}') === -1) {
          continue;
        }
      }

      if (Types.isClass(currentType)) {
        this.parseClzz(currentType);

        if (p.in === 'query') {
          // 如果@Query()装饰的 是一个对象，则把该对象的子属性作为多个@Query参数
          const schema = this.documentBuilder.getSchema(currentType.name);
          Object.keys(schema.properties).forEach(pName => {
            const ppt: any = schema.properties[pName];
            const pp = {
              name: pName,
              in: p.in,
            };
            this.parseFromParamsToP({ metadata: ppt }, pp);
            parameters.push(pp);
          });
          continue;
        } else {
          p.schema = {
            $ref: '#/components/schemas/' + currentType.name,
          };
        }
      } else {
        p.schema = {
          type: convertSchemaType(currentType?.name ?? currentType),
        };
      }

      this.parseFromParamsToP(
        params[params.length - 1 - arg.parameterIndex],
        p
      );

      if (p.in === 'body') {
        if (webRouter.requestMethod === RequestMethod.GET) {
          continue;
        }
        // 这里兼容一下 @File()、@Files()、@Fields() 装饰器
        if (arg.metadata?.type === RouteParamTypes.FILESSTREAM) {
          p.schema = {
            type: 'object',
            properties: {
              files: {
                type: 'array',
                items: {
                  type: 'string',
                  format: 'binary',
                },
                description: p.description,
              },
            },
          };
          p.contentType = BodyContentType.Multipart;
        }
        if (arg.metadata?.type === RouteParamTypes.FILESTREAM) {
          p.schema = {
            type: 'object',
            properties: {
              file: {
                type: 'string',
                format: 'binary',
                description: p.description,
              },
            },
          };
          p.contentType = BodyContentType.Multipart;
        }
        if (arg.metadata?.type === RouteParamTypes.FIELDS) {
          this.expandSchemaRef(p);

          p.contentType = BodyContentType.Multipart;
        }

        if (!p.content) {
          p.content = {};
          p.content[p.contentType || 'application/json'] = {
            schema: p.schema,
          };
        }
        if (!opts[webRouter.requestMethod].requestBody) {
          const requestBody = {
            required: true,
            description: p.description || p.name,
            content: p.content,
          };
          opts[webRouter.requestMethod].requestBody = requestBody;
        } else {
          // 这里拼 schema properties 时肯定存在
          Object.assign(
            opts[webRouter.requestMethod].requestBody.content[p.contentType]
              .schema.properties,
            p.schema.properties
          );
        }

        delete p.contentType;
        delete p.content;
        // in body 不需要处理
        continue;
      }

      parameters.push(p);
    }
    // class header 需要使用 ApiHeader 装饰器
    if (header) {
      parameters.unshift(header);
    }

    opts[webRouter.requestMethod].parameters = parameters;

    const responses = metaForMethods.filter(
      item =>
        item.key === DECORATORS.API_RESPONSE &&
        item.propertyName === webRouter.method
    );
    const returnResponses = {};
    for (const r of responses) {
      const resp = r.metadata;
      const keys = Object.keys(resp);
      for (const k of keys) {
        // 这里是引用，赋值可以直接更改
        const tt = resp[k];
        if (tt.type) {
          if (Types.isClass(tt.type)) {
            this.parseClzz(tt.type);

            if (tt.isArray) {
              tt.content = {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/' + tt.type.name,
                    },
                  },
                },
              };
            } else {
              tt.content = {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/' + tt.type.name,
                  },
                },
              };
            }
          } else {
            tt.content = {
              'text/plan': {
                schema: {
                  type: convertSchemaType(tt.type),
                },
              },
            };
          }
        }
        delete tt.status;
        delete tt.type;
        delete tt.isArray;
        delete tt.format;
      }

      Object.assign(returnResponses, resp);
    }

    if (Object.keys(returnResponses).length > 0) {
      opts[webRouter.requestMethod].responses = returnResponses;
    } else {
      opts[webRouter.requestMethod].responses = {
        200: {
          description: 'OK',
        },
      };
    }

    paths[url] = opts;
  }

  private expandSchemaRef(p: any, name?: string) {
    let schemaName = name;
    if (p.schema['$ref']) {
      // 展开各个字段属性
      schemaName = p.schema['$ref'].replace('#/components/schemas/', '');
      delete p.schema['$ref'];
    }

    const schema = this.documentBuilder.getSchema(schemaName);
    const ss = JSON.parse(JSON.stringify(schema));
    if (p.schema.properties) {
      Object.assign(p.schema.properties, ss.properties);
    } else {
      p.schema = JSON.parse(JSON.stringify(schema));
    }
    return p;
  }
  /**
   * 提取参数
   * @param params
   * @param p
   */
  private parseFromParamsToP(paramMeta: any, p: any) {
    if (paramMeta) {
      const param = paramMeta.metadata;

      if (param) {
        p.description = param.description;
        if (!p.name && param.name) {
          p.name = param.name;
        }
        if (param.in === 'query') {
          p.allowEmptyValue = param.allowEmptyValue || false;
        }
        if (typeof param.example !== undefined) {
          p.example = param.example;
        }
        if (param.examples) {
          p.examples = param.examples;
        }
        if (param.deprecated) {
          p.deprecated = param.deprecated;
        }
        if (param.contentType) {
          p.contentType = param.contentType;
        }
        p.in = param?.in ?? p.in;
        p.required = param?.required ?? p.required;
        if (p.in === 'query') {
          p.style = 'form';
        } else if (p.in === 'path' || p.in === 'header') {
          p.style = 'simple';
        } else if (p.in === 'cookie') {
          p.style = 'form';
        }
        p.explode = p.style === 'form';
        // response content
        if (param?.content) {
          p.content = param?.content;
        }
        if (param.schema) {
          p.schema = param.schema;
        } else {
          if (param.type) {
            if (Types.isClass(param.type)) {
              this.parseClzz(param.type);

              p.schema = {
                $ref: '#/components/schemas/' + param.type.name,
              };
            }

            if (param.isArray) {
              let ref;
              if (p?.schema?.$ref) {
                ref = p.schema.$ref;
              }

              p.schema = {
                type: 'array',
                items: {
                  format: param.format,
                },
              };
              if (ref) {
                p.schema.items.$ref = ref;
              } else {
                p.schema.items.type = convertSchemaType(param.type);
              }
            } else {
              if (!p.schema) {
                p.schema = {
                  type: param.type ? convertSchemaType(param.type) : p.type,
                  format: param.format || p.format,
                };
              }
            }
          } else if (param.format) {
            p.schema.format = param.format;
          }
        }
      }
    }
  }
  /**
   * 解析 ApiExtraModel
   * @param clzz
   */
  private parseExtraModel(clzz: any) {
    const metaForMethods: any[] =
      getClassMetadata(INJECT_CUSTOM_METHOD, clzz) || [];
    const extraModels = metaForMethods.filter(
      item => item.key === DECORATORS.API_EXTRA_MODEL
    );
    for (const m of extraModels) {
      if (Array.isArray(m.metadata)) {
        for (const sclz of m.metadata) {
          this.parseClzz(sclz);
        }
      } else {
        this.parseClzz(m.metadata);
      }
    }
  }

  protected parseSubPropertyType(metadata: any) {
    let typeMeta;
    if (metadata?.enum) {
      typeMeta = {
        type: metadata?.type,
        enum: metadata?.enum,
        default: metadata?.default,
      };

      if (metadata?.description) {
        typeMeta.description = metadata?.description;
      }
      return typeMeta;
    }

    if (metadata?.items?.enum) {
      typeMeta = {
        type: metadata?.type,
        items: metadata?.items,
        default: metadata?.default,
      };

      if (metadata?.description) {
        typeMeta.description = metadata?.description;
      }
      return typeMeta;
    }

    let isArray = false;
    let currentType = parseTypeSchema(metadata?.type);

    delete metadata?.type;

    if (currentType === 'array') {
      isArray = true;
      currentType = parseTypeSchema(metadata?.items?.type);

      delete metadata?.items.type;
    }

    if (metadata?.oneOf) {
      typeMeta = {
        oneOf: [],
      };
      metadata?.oneOf.forEach((item: any) => {
        typeMeta.push(this.parseSubPropertyType(item));
      });
      delete metadata?.oneOf;
    }

    if (Types.isClass(currentType)) {
      this.parseClzz(currentType);

      if (isArray) {
        typeMeta = {
          type: 'array',
          items: {
            $ref: '#/components/schemas/' + currentType?.name,
          },
        };
      } else {
        typeMeta = {
          $ref: '#/components/schemas/' + currentType?.name,
        };
      }

      delete metadata.items;
    } else {
      if (isArray) {
        // 没有配置类型则认为自己配置了 items 内容
        if (!currentType) {
          if (metadata?.items?.['$ref']) {
            metadata.items['$ref'] = parseTypeSchema(metadata.items['$ref']);
          }

          typeMeta = {
            type: 'array',
            items: metadata?.items,
          };
        } else {
          typeMeta = {
            type: 'array',
            items: {
              type: convertSchemaType(currentType?.name || currentType),
            },
          };
        }

        delete metadata.items;
      } else {
        typeMeta = {
          type: currentType,
          format: metadata?.format,
        };

        // Date 类型支持
        if (typeMeta.type === 'Date') {
          typeMeta.type = 'string';
          if (!typeMeta.format) {
            typeMeta.format = 'date';
          }
        }

        delete metadata.format;
      }
    }

    return Object.assign(typeMeta, metadata);
  }

  /**
   * 解析类型的 ApiProperty
   * @param clzz
   */
  protected parseClzz(clzz: Type) {
    if (this.documentBuilder.getSchema(clzz.name)) {
      return this.documentBuilder.getSchema(clzz.name);
    }
    this.parseExtraModel(clzz);

    const props = getClassExtendedMetadata(INJECT_CUSTOM_PROPERTY, clzz);

    const tt: any = {
      type: 'object',
      properties: {},
    };

    if (props) {
      Object.keys(props).forEach(key => {
        const metadata = props[key].metadata;
        if (typeof metadata?.required !== undefined) {
          if (metadata?.required) {
            if (!tt.required) {
              tt.required = [];
            }
            tt.required.push(key);
          }

          delete metadata.required;
        }
        if (metadata?.enum) {
          tt.properties[key] = {
            type: metadata?.type,
            enum: metadata?.enum,
            default: metadata?.default,
          };

          if (metadata?.description) {
            tt.properties[key].description = metadata?.description;
          }
          return;
        }
        if (metadata?.items?.enum) {
          tt.properties[key] = {
            type: metadata?.type,
            items: metadata?.items,
            default: metadata?.default,
          };

          if (metadata?.description) {
            tt.properties[key].description = metadata?.description;
          }
          return;
        }
        let isArray = false;
        let currentType = parseTypeSchema(metadata?.type);

        delete metadata?.type;

        if (currentType === 'array') {
          isArray = true;
          currentType = parseTypeSchema(metadata?.items?.type);

          delete metadata?.items.type;
        }

        if (metadata?.oneOf) {
          tt.properties[key] = {
            oneOf: [],
          };
          metadata?.oneOf.forEach((meta: any) => {
            tt.properties[key].oneOf.push(this.parseSubPropertyType(meta));
          });
          delete metadata?.oneOf;
          return;
        }

        if (Types.isClass(currentType)) {
          this.parseClzz(currentType);

          if (isArray) {
            tt.properties[key] = {
              type: 'array',
              items: {
                $ref: '#/components/schemas/' + currentType?.name,
              },
            };
          } else {
            tt.properties[key] = {
              $ref: '#/components/schemas/' + currentType?.name,
            };
          }

          delete metadata.items;
        } else {
          if (isArray) {
            // 没有配置类型则认为自己配置了 items 内容
            if (!currentType) {
              if (metadata?.items?.['$ref']) {
                metadata.items['$ref'] = parseTypeSchema(
                  metadata.items['$ref']
                );
              }

              tt.properties[key] = {
                type: 'array',
                items: metadata?.items,
              };
            } else {
              tt.properties[key] = {
                type: 'array',
                items: {
                  type: convertSchemaType(currentType?.name || currentType),
                },
              };
            }

            delete metadata.items;
          } else {
            tt.properties[key] = {
              type: currentType ?? getPropertyType(clzz.prototype, key).name,
              format: metadata?.format,
            };

            // Date 类型支持
            if (tt.properties[key].type === 'Date') {
              tt.properties[key].type = 'string';
              if (!tt.properties[key].format) {
                tt.properties[key].format = 'date';
              }
            }

            delete metadata.format;
          }
        }

        Object.assign(tt.properties[key], metadata);
      });
    }

    this.documentBuilder.addSchema({
      [clzz.name]: tt,
    });

    // just for test
    return tt;
  }
  /**
   * 授权验证
   * @param opts
   * @returns
   */
  private setAuth(opts: AuthOptions) {
    if (!opts) {
      return;
    }
    const authType = opts.authType;
    delete opts.authType;
    // TODO 加 security
    switch (authType) {
      case 'basic':
        {
          const name = opts.name;
          delete opts.name;
          this.documentBuilder.addBasicAuth(opts as SecuritySchemeObject, name);
        }
        break;
      case 'bearer':
        {
          const name = opts.name;
          delete opts.name;
          this.documentBuilder.addBearerAuth(
            opts as SecuritySchemeObject,
            name
          );
        }
        break;
      case 'cookie':
        {
          const cname = opts.cookieName;
          const secName = opts.securityName;
          delete opts.cookieName;
          delete opts.securityName;
          this.documentBuilder.addCookieAuth(
            cname,
            opts as SecuritySchemeObject,
            secName
          );
        }
        break;
      case 'oauth2':
        {
          const name = opts.name;
          delete opts.name;
          this.documentBuilder.addOAuth2(opts as SecuritySchemeObject, name);
        }
        break;
      case 'apikey':
        {
          const name = opts.name;
          delete opts.name;
          this.documentBuilder.addApiKey(opts as SecuritySchemeObject, name);
        }
        break;
      case 'custom':
        {
          this.documentBuilder.addSecurity(
            opts?.name,
            opts as SecuritySchemeObject
          );
        }
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
      const paramName = item.slice(1);
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
    case RouteParamTypes.FIELDS:
    case RouteParamTypes.FILESSTREAM:
    case RouteParamTypes.FILESTREAM:
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
      return value;
  }
}

function getNotEmptyValue(...args) {
  for (const arg of args) {
    if (arg) {
      return arg;
    }
  }
}

function parseTypeSchema(ref) {
  switch (ref) {
    case String:
      return 'string';
    case Number:
      return 'number';
    case Boolean:
      return 'boolean';
    default:
      if (typeof ref === 'function' && !Types.isClass(ref)) {
        ref = ref();
      }
      return ref;
  }
}
