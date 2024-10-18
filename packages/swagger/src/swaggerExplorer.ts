import {
  Config,
  CONTROLLER_KEY,
  ControllerOption,
  Init,
  Provide,
  RequestMethod,
  RouteParamTypes,
  RouterOption,
  Scope,
  ScopeEnum,
  Types,
  WEB_ROUTER_KEY,
  WEB_ROUTER_PARAM_KEY,
  MetadataManager,
  DecoratorManager,
  CUSTOM_PARAM_INJECT_KEY,
  CUSTOM_PROPERTY_INJECT_KEY,
} from '@midwayjs/core';
import {
  MixDecoratorMetadata,
  PathItemObject,
  SchemaObject,
  Type,
} from './interfaces';
import {
  DECORATORS,
  DECORATORS_CLASS_METADATA,
  DECORATORS_METHOD_METADATA,
} from './constants';
import { DocumentBuilder } from './documentBuilder';
import {
  AuthOptions,
  SecuritySchemeObject,
  SwaggerOptions,
} from './interfaces/';
import { BodyContentType } from '.';
import { getEnumValues } from './common/enum.utils';

@Provide()
@Scope(ScopeEnum.Singleton)
export class SwaggerExplorer {
  @Config('swagger')
  private swaggerConfig: SwaggerOptions = {};

  private documentBuilder = new DocumentBuilder();
  private operationIdFactory = (
    controllerKey: string,
    webRouter: RouterOption
  ) => `${controllerKey.toLowerCase()}_${webRouter.method.toLocaleLowerCase()}`;

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

    if (this.swaggerConfig?.documentOptions?.operationIdFactory) {
      this.operationIdFactory =
        this.swaggerConfig.documentOptions.operationIdFactory;
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

  public addGlobalPrefix(globalPrefix: string) {
    if (!globalPrefix) {
      return;
    }
    const paths = this.documentBuilder.getPaths();

    // 添加统一前缀后的接口地址
    const newPaths: Record<string, PathItemObject> = {};
    for (const [routerUrl, value] of Object.entries(paths)) {
      // 处理路由
      if (!/^\//.test(routerUrl)) {
        newPaths[`${globalPrefix}/${routerUrl}`] = value;
      } else {
        newPaths[`${globalPrefix}${routerUrl}`] = value;
      }
    }
    this.documentBuilder.setPaths(newPaths);
  }

  public scanApp() {
    const routes = DecoratorManager.listModule(CONTROLLER_KEY);

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

  public getDocumentBuilder() {
    return this.documentBuilder;
  }

  protected generatePath(target: Type) {
    // 获取控制器元数据
    const excludeClassMeta = MetadataManager.getOwnMetadata(
      DECORATORS.API_EXCLUDE_CONTROLLER,
      target
    );

    if (excludeClassMeta && excludeClassMeta.disable) {
      // 如果存在需要排除的控制器，则直接返回
      return;
    }

    const isGenerateTagForController =
      this.swaggerConfig.isGenerateTagForController ?? true;

    // 解析额外的模型
    this.parseExtraModel(target);

    const metaForClass =
      MetadataManager.getOwnMetadata<MixDecoratorMetadata[]>(
        DECORATORS_CLASS_METADATA,
        target
      ) || [];

    // 获取参数的元数据
    const metaForParams =
      MetadataManager.getPropertiesWithMetadata(
        CUSTOM_PARAM_INJECT_KEY,
        target
      ) || {};

    // 获取控制器选项
    const controllerOption: ControllerOption = MetadataManager.getOwnMetadata(
      CONTROLLER_KEY,
      target
    );

    // 获取前缀
    const prefix = controllerOption.prefix;
    // 过滤出标签
    const tags = metaForClass.filter(item => item.key === DECORATORS.API_TAGS);
    let strTags: string[] = [];
    const controllerTags = [];
    // 如果存在标签，则将其添加到文档构建器中
    if (tags.length > 0) {
      strTags = parseTags(tags);
      strTags.forEach(tag => {
        addTag(tag, controllerTags);
      });
    } else {
      if (isGenerateTagForController) {
        // 如果不存在标签，则根据控制器选项生成标签
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
        // 如果标签名存在，则将其添加到文档构建器中
        if (tag.name) {
          strTags.push(tag.name);
          addTag([tag.name, tag.description], controllerTags);
        }
      } else {
        // 否则不添加标签
      }
    }

    // 获取路由信息
    const webRouterInfo: RouterOption[] = MetadataManager.getMetadata(
      WEB_ROUTER_KEY,
      target
    );

    // 过滤出头部信息
    let headers = metaForClass.filter(
      item => item.key === DECORATORS.API_HEADERS
    );
    if (headers.length > 0) {
      headers = headers.map(item => item.metadata);
    }

    // 过滤出安全信息
    const security = metaForClass.filter(
      item => item.key === DECORATORS.API_SECURITY
    );

    // 初始化路径对象
    const paths: Record<string, PathItemObject> = {};
    // 如果存在路由信息，则遍历生成路径
    if (webRouterInfo && typeof webRouterInfo[Symbol.iterator] === 'function') {
      for (const webRouter of webRouterInfo) {
        // 生成URL
        let url = (prefix + webRouter.path).replace('//', '/');
        url = replaceUrl(url, parseParamsInPath(url));

        // 方法元数据
        const metaForMethods =
          MetadataManager.getMetadata<MixDecoratorMetadata[]>(
            DECORATORS_METHOD_METADATA,
            target,
            webRouter.method
          ) || [];

        // 判断是否忽略当前路由
        const endpoints = metaForMethods.filter(
          item =>
            item.key === DECORATORS.API_EXCLUDE_ENDPOINT &&
            item.propertyName === webRouter.method
        );
        // 如果存在需要忽略的路由，则跳过当前循环
        if (endpoints[0]) {
          continue;
        }

        // 判断是否需要过滤当前路由
        if (this.swaggerConfig.routerFilter) {
          const isFilter = this.swaggerConfig.routerFilter(url, webRouter);
          if (isFilter) {
            continue;
          }
        }

        // 获取路由参数
        const routerArgs = metaForParams[webRouter.method] || [];
        // 过滤出主体参数
        const bds = routerArgs.filter(
          item =>
            item.key === WEB_ROUTER_PARAM_KEY &&
            item?.metadata?.type === RouteParamTypes.BODY
        );
        // 如果存在多个主体参数，则跳过当前循环，因为swagger不支持多个@Body
        if (bds.length > 1) {
          continue;
        }

        // 生成路由方法
        this.generateRouteMethod(
          url,
          webRouter,
          paths,
          metaForMethods,
          routerArgs,
          headers,
          target
        );

        // 如果当前路径的标签长度为0，则赋值标签
        if (paths[url][webRouter.requestMethod].tags.length === 0) {
          paths[url][webRouter.requestMethod].tags = strTags;
        } else {
          // 如果 tags 不在全局中，则添加
          paths[url][webRouter.requestMethod].tags.forEach(tag => {
            addTag(tag, controllerTags);
          });
        }

        // 过滤出扩展信息
        const exts = metaForMethods.filter(
          item =>
            item.key === DECORATORS.API_EXTENSION &&
            item.propertyName === webRouter.method
        );
        // 如果存在扩展信息，则将其添加到路径中
        for (const e of exts) {
          if (e.metadata) {
            Object.assign(paths[url][webRouter.requestMethod], e.metadata);
          }
        }

        const excludeSecurity = metaForMethods.find(item => {
          return item.key === DECORATORS.API_EXCLUDE_SECURITY;
        });

        // 如果存在安全信息，则将其添加到路径中
        if (security.length > 0 && !excludeSecurity) {
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

    // 将路径添加到文档构建器中
    this.documentBuilder.addPaths(paths);
    // 将控制器标签添加到文档构建器中
    if (Object.keys(paths).length > 0) {
      controllerTags.forEach(tag => {
        if (Array.isArray(tag)) {
          this.documentBuilder.addTag(tag[0], tag[1]);
        } else {
          this.documentBuilder.addTag(tag);
        }
      });
    }
  }

  /**
   * 构造 router 提取方法
   */
  private generateRouteMethod(
    url: string,
    webRouter: RouterOption,
    paths: Record<string, PathItemObject>,
    metaForMethods: MixDecoratorMetadata[],
    routerArgs: any[],
    headers: any,
    target: Type
  ) {
    const operMeta = metaForMethods.filter(
      item =>
        item.key === DECORATORS.API_OPERATION &&
        item.propertyName === webRouter.method
    )[0];

    const routerTagsMeta = metaForMethods.filter(
      item =>
        item.key === DECORATORS.API_TAGS &&
        item.propertyName === webRouter.method
    );

    const routerTags = parseTags(routerTagsMeta);

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
      operationId:
        operMeta?.metadata?.operationId ||
        this.getOperationId(target.name, webRouter),
      tags: routerTags.length ? routerTags : operMeta?.metadata?.tags ?? [],
    };
    if (operMeta?.metadata?.deprecated != null) {
      opts[webRouter.requestMethod].deprecated =
        !!operMeta?.metadata?.deprecated;
    }
    /**
     * [{"key":"web:router_param","parameterIndex":1,"propertyName":"create","metadata":{"type":2}},
     * {"key":"web:router_param","parameterIndex":0,"propertyName":"create","metadata":{"type":1,"propertyData":"createCatDto"}}]
     */
    // WEB_ROUTER_PARAM_KEY
    const args: any[] = routerArgs.filter(
      item =>
        item.key === WEB_ROUTER_PARAM_KEY &&
        item?.metadata?.type !== RouteParamTypes.CUSTOM
    );
    const types = MetadataManager.getMethodParamTypes(target, webRouter.method);
    const params = metaForMethods.filter(
      item =>
        item.key === DECORATORS.API_PARAMETERS &&
        item.propertyName === webRouter.method
    );

    // set params information from @ApiQuery() to parameters
    for (const param of params) {
      // rebuild query param to swagger format
      if (param.metadata.schema === undefined) {
        param.metadata.schema = {};
        if (param.metadata.type) {
          param.metadata.schema['type'] = param.metadata.type;
          delete param.metadata.type;
        }
        if (param.metadata.isArray) {
          param.metadata.schema['items'] = {
            type: param.metadata.schema['type'],
          };
          param.metadata.schema['type'] = 'array';
          delete param.metadata.isArray;
        }
        if (param.metadata.enum !== undefined) {
          param.metadata.schema.enum = param.metadata.enum;
          delete param.metadata.enum;
        }
      } else {
        // if schema is defined, then type is not needed
        delete param.metadata.type;
        delete param.metadata.isArray;
        delete param.metadata.enum;
      }

      const p = param.metadata;
      p.schema = this.formatType(param.metadata.schema);

      if (p.in === 'query' || p.in === 'path' || p.in === 'header') {
        parameters.push(p);
      } else if (p.in === 'body') {
        p.content = p.content ?? {};
        if (Object.keys(p.content).length === 0) {
          p.content[p.contentType || 'application/json'] = p.content[
            p.contentType || 'application/json'
          ] ?? {
            schema: p.schema,
          };
        }

        // format schema
        for (const key in p.content) {
          p.content[key].schema = this.formatType(p.content[key].schema);
        }

        // if requestBody is already set, skip
        opts[webRouter.requestMethod].requestBody =
          opts[webRouter.requestMethod].requestBody ?? {};
        opts[webRouter.requestMethod].requestBody.description =
          opts[webRouter.requestMethod].requestBody.description ??
          p.description;
        opts[webRouter.requestMethod].requestBody.content =
          opts[webRouter.requestMethod].requestBody.content ?? p.content;
        opts[webRouter.requestMethod].requestBody.required =
          opts[webRouter.requestMethod].requestBody.required ?? p.required;
      }
    }

    for (const arg of args) {
      const currentType = types[arg.parameterIndex];
      const p: any = {
        name: arg?.metadata?.propertyData,
        in: convertTypeToString(arg.metadata?.type),
        required: false,
      };

      const existsParam = parameters.find(item => {
        return item.name === arg?.metadata?.propertyData && item.in === p.in;
      });

      // if exists same param from @ApiQuery and other decorator, just skip
      if (existsParam) {
        continue;
      }

      if (p.in === 'path') {
        p.required = true;

        if (url.indexOf('{' + p.name + '}') === -1) {
          continue;
        }
      }

      if (Types.isClass(currentType)) {
        this.parseClzz(currentType);
      }

      if (p.in === 'query' || p.in === 'path') {
        if (Types.isClass(currentType)) {
          // 如果@Query()装饰的 是一个对象，则把该对象的子属性作为多个@Query参数
          const schema = this.documentBuilder.getSchema(currentType.name);
          Object.keys(schema.properties).forEach(pName => {
            const pp = {
              name: pName,
              in: p.in,
              description: (schema.properties[pName] as SchemaObject)
                ?.description,
              schema: schema.properties[pName],
              required: schema.required?.includes(pName) || false,
            };
            parameters.push(pp);
          });
          continue;
        } else {
          if (!p.name) {
            continue;
          }
          p.schema = {
            type: convertSchemaType(currentType?.name ?? currentType),
          };
        }
      } else if (p.in === 'body') {
        if (webRouter.requestMethod === RequestMethod.GET) {
          continue;
        }
        // if requestBody is already set, skip
        if (opts[webRouter.requestMethod].requestBody) {
          continue;
        }

        // 这里兼容一下 @File()、@Files()、@Fields() 装饰器
        if (arg.metadata?.type === RouteParamTypes.FILESSTREAM) {
          p.content = {};
          p.content[BodyContentType.Multipart] = {
            schema: {
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
            },
          };
        } else if (arg.metadata?.type === RouteParamTypes.FILESTREAM) {
          p.content = {};
          p.content[BodyContentType.Multipart] = {
            schema: {
              type: 'object',
              properties: {
                file: {
                  type: 'string',
                  format: 'binary',
                  description: p.description,
                },
              },
            },
          };
        } else {
          if (Types.isClass(currentType)) {
            p.content = {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/' + currentType.name,
                },
              },
            };
          } else {
            // base type
            p.content = {
              'text/plain': {
                schema: {
                  type: convertSchemaType(currentType?.name ?? currentType),
                },
              },
            };
          }
        }

        opts[webRouter.requestMethod].requestBody = {
          required: true,
          description: p.description || p.name,
          content: p.content,
        };
        // in body 不需要处理
        continue;
      }

      parameters.push(p);
    }
    // class header 需要使用 ApiHeader 装饰器
    if (headers && headers.length) {
      headers.forEach(header => parameters.unshift(header));
    }

    // 获取方法上的 @ApiHeader
    const methodHeaders = metaForMethods.filter(
      item => item.key === DECORATORS.API_HEADERS
    );

    if (methodHeaders.length > 0) {
      methodHeaders.forEach(item => parameters.unshift(item.metadata));
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

        if (tt.schema) {
          // response 的 schema 需要包含在 content 内
          tt.content = {
            'application/json': {
              schema: this.formatType(tt.schema),
            },
          };
          delete tt.schema;
        } else if (tt.type) {
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

  getOperationId(controllerKey: string, webRouter: RouterOption) {
    return this.operationIdFactory(controllerKey, webRouter);
  }

  /**
   * 解析 ApiExtraModel
   * @param clzz
   */
  private parseExtraModel(clzz: any) {
    const metaForClass =
      MetadataManager.getOwnMetadata<MixDecoratorMetadata[]>(
        DECORATORS_CLASS_METADATA,
        clzz
      ) || [];
    const extraModels = metaForClass.filter(
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

  protected formatType(metadata: {
    type: any;
    items?: any;
    format?: string;
    oneOf?: any[];
    allOf?: any[];
    anyOf?: any[];
    not?: any;
    enum?: any[];
    properties?: any;
    additionalProperties?: any;
    $ref?: any;
  }) {
    if (metadata === null) {
      return null;
    }

    // 如果有枚举，单独处理
    if (metadata.enum) {
      if (Array.isArray(metadata.enum)) {
        // enum 不需要处理
        metadata.enum.map(item => this.formatType(item));
      } else {
        // 枚举类型需要处理
        metadata.enum = getEnumValues(metadata.enum);
      }
    }

    if (metadata.not) {
      metadata.not = this.formatType(metadata.not);
    }

    if (metadata['$ref'] && typeof metadata['$ref'] === 'function') {
      metadata['$ref'] = metadata['$ref']();
    }

    if (metadata.oneOf) {
      metadata.oneOf = metadata.oneOf.map(item => this.formatType(item));
    } else if (metadata.anyOf) {
      metadata.anyOf = metadata.anyOf.map(item => this.formatType(item));
    } else if (metadata.allOf) {
      metadata.allOf = metadata.allOf.map(item => this.formatType(item));
    }

    // 有下面的这些属性，就不需要 type 了
    ['not', '$ref', 'oneOf', 'anyOf', 'allOf'].forEach(key => {
      if (metadata[key]) {
        delete metadata['type'];
      }
    });

    if (metadata.properties) {
      const properties = {};
      for (const key in metadata.properties) {
        properties[key] = this.formatType(metadata.properties[key]);
      }
      metadata.properties = properties;
    }

    if (metadata.additionalProperties) {
      metadata.additionalProperties = this.formatType(
        metadata.additionalProperties
      );
    }

    // 处理类型
    if (['string', 'number', 'boolean', 'integer'].includes(metadata.type)) {
      // 不做处理
    } else if (metadata.type === Number) {
      metadata.type = 'number';
    } else if (metadata.type === String) {
      metadata.type = 'string';
    } else if (metadata.type === Boolean) {
      metadata.type = 'boolean';
    } else if (
      metadata.type === 'date' ||
      metadata.type === 'Date' ||
      metadata.type === Date
    ) {
      metadata.type = 'string';
      metadata.format = 'date-time';
    } else if (metadata.type === Array || metadata.type === 'array') {
      // Array => { type: 'array' }
      metadata.type = 'array';
      if (metadata.items) {
        metadata.items = this.formatType(metadata.items);
      }
    } else if (Array.isArray(metadata.type)) {
      // [String] => { type: 'array', items: { type: 'string' } }
      metadata.items = this.formatType({ type: metadata.type[0] });
      metadata.type = 'array';
    } else if (metadata.type === Object || metadata.type === 'object') {
      metadata.type = 'object';
    } else if (Types.isClass(metadata.type)) {
      this.parseClzz(metadata.type);
      metadata['$ref'] = '#/components/schemas/' + metadata.type.name;
      delete metadata['type'];
    } else if (metadata.type instanceof Function) {
      // () => String => { type: 'string' }
      metadata.type = metadata.type();
      this.formatType(metadata);
    }
    return metadata;
  }

  /**
   * 解析类型的 ApiProperty
   * @param clzz
   */
  protected parseClzz(clzz: Type) {
    if (this.documentBuilder.getSchema(clzz.name)) {
      return this.documentBuilder.getSchema(clzz.name);
    }
    // 解析 ApiExtraModel
    this.parseExtraModel(clzz);
    // 解析类上的 ApiProperty
    // TODO 这里后面不能用这个方法
    const props =
      MetadataManager.getPropertiesWithMetadata(
        CUSTOM_PROPERTY_INJECT_KEY,
        clzz
      ) || {};
    // 这里属性值唯一，取数组最后一个
    for (const key in props) {
      props[key] = props[key][props[key].length - 1];
    }

    const tt: any = {
      type: 'object',
      properties: {},
    };

    // 先添加到 schema，防止递归循环
    this.documentBuilder.addSchema({
      [clzz.name]: tt,
    });

    if (props) {
      for (const key of Object.keys(props)) {
        const metadata = props[key].metadata || {};
        if (!metadata.type) {
          // 推导类型
          metadata.type = MetadataManager.transformTypeFromTSDesign(MetadataManager.getPropertyType(
            clzz.prototype,
            key
          )).name;
        }
        tt.properties[key] = tt.properties[key] || {};

        // loop metadata
        for (const metadataKey in metadata) {
          if (metadataKey === 'required' && metadata['required']) {
            // required 需要加到 schema 上
            if (!tt.required) {
              tt.required = [];
            }
            tt.required.push(key);
          } else if (['oneOf', 'anyOf', 'allOf'].includes(metadataKey)) {
            tt.properties[key][metadataKey] = [];
            metadata[metadataKey].forEach((meta: any) => {
              tt.properties[key][metadataKey].push(this.formatType(meta));
            });
          } else if (metadataKey === 'not') {
            tt.properties[key][metadataKey] = this.formatType(
              metadata[metadataKey]
            );
          } else if (metadataKey === 'type') {
            this.formatType(metadata);
            if (metadata.type) {
              tt.properties[key].type = metadata.type;
            }
            if (metadata['$ref']) {
              tt.properties[key].$ref = metadata['$ref'];
            }
            if (metadata.items) {
              tt.properties[key].items = metadata.items;
            }
            if (metadata.format) {
              tt.properties[key].format = metadata.format;
            }
            if (metadata.pattern) {
              tt.properties[key].pattern = metadata.pattern;
            }
            if (metadata.enum) {
              tt.properties[key].enum = metadata.enum;
            }
          } else if (
            metadataKey === 'items' ||
            metadataKey === 'pattern' ||
            metadataKey === 'format' ||
            metadataKey === 'enum' ||
            metadataKey === '$ref'
          ) {
            // type 中已经处理
          } else {
            tt.properties[key][metadataKey] = metadata[metadataKey];
          }
        }
      }
    }
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
      return 'object';
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

function parseTags(
  tags: Array<{
    metadata: string;
  }>
) {
  let strTags: string[] = [];
  if (tags.length > 0) {
    for (const t of tags) {
      // 这里 metadata => string[]
      strTags = strTags.concat(t.metadata);
    }
  }
  return strTags;
}

function addTag(newTag: string | string[], tags = []) {
  /**
   * tag 结构
   * ['name', 'description'] 或者 'name'
   */
  if (
    // 处理重复的标签
    tags.find(t => {
      if (Array.isArray(newTag)) {
        return t === newTag[0];
      } else {
        return t === newTag;
      }
    })
  ) {
    // ignore
  } else {
    tags.push(newTag);
  }
}
