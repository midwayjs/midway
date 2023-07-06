/**
 * inspired by https://github.com/metadevpro/openapi3-ts
 * @see https://github.com/OAI/OpenAPI-Specification/blob/3.0.0-rc0/versions/3.0.md
 */

export interface OpenAPIObject {
  openapi: string;
  info: InfoObject;
  servers?: ServerObject[];
  paths: PathsObject;
  components?: ComponentsObject;
  security?: SecurityRequirementObject[];
  tags?: TagObject[];
  externalDocs?: ExternalDocumentationObject;
}

export interface InfoObject {
  title: string;
  description?: string;
  termsOfService?: string;
  contact?: ContactObject;
  license?: LicenseObject;
  version: string;
}

export interface ContactObject {
  name?: string;
  url?: string;
  email?: string;
}

export interface LicenseObject {
  name: string;
  url?: string;
}

export interface ServerObject {
  url: string;
  description?: string;
  variables?: Record<string, ServerVariableObject>;
}

export interface ServerVariableObject {
  enum?: string[] | boolean[] | number[];
  default: string | boolean | number;
  description?: string;
}

export interface ComponentsObject {
  schemas?: Record<string, SchemaObject | ReferenceObject>;
  responses?: Record<string, ResponseObject | ReferenceObject>;
  parameters?: Record<string, ParameterObject | ReferenceObject>;
  examples?: Record<string, ExampleObject | ReferenceObject>;
  requestBodies?: Record<string, RequestBodyObject | ReferenceObject>;
  headers?: Record<string, HeaderObject | ReferenceObject>;
  securitySchemes?: Record<string, SecuritySchemeObject | ReferenceObject>;
  links?: Record<string, LinkObject | ReferenceObject>;
  callbacks?: Record<string, CallbackObject | ReferenceObject>;
}

export type PathsObject = Record<string, PathItemObject>;
export interface PathItemObject {
  $ref?: string;
  summary?: string;
  description?: string;
  get?: OperationObject;
  put?: OperationObject;
  post?: OperationObject;
  delete?: OperationObject;
  options?: OperationObject;
  head?: OperationObject;
  patch?: OperationObject;
  trace?: OperationObject;
  servers?: ServerObject[];
  parameters?: (ParameterObject | ReferenceObject)[];
}

export interface OperationObject {
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: ExternalDocumentationObject;
  operationId?: string;
  parameters?: (ParameterObject | ReferenceObject)[];
  requestBody?: RequestBodyObject | ReferenceObject;
  responses: ResponsesObject;
  callbacks?: CallbacksObject;
  deprecated?: boolean;
  security?: SecurityRequirementObject[];
  servers?: ServerObject[];
}

export interface ExternalDocumentationObject {
  description?: string;
  url: string;
}

export type ParameterLocation = 'query' | 'header' | 'path' | 'cookie';
export type ParameterStyle =
  | 'matrix'
  | 'label'
  | 'form'
  | 'simple'
  | 'spaceDelimited'
  | 'pipeDelimited'
  | 'deepObject';

export interface BaseParameterObject {
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: ParameterStyle;
  explode?: boolean;
  allowReserved?: boolean;
  schema?: SchemaObject | ReferenceObject;
  examples?: Record<string, ExampleObject | ReferenceObject>;
  example?: any;
  content?: ContentObject;
}

export interface ParameterObject extends BaseParameterObject {
  name: string;
  in: ParameterLocation;
}

export interface RequestBodyObject {
  description?: string;
  content: ContentObject;
  required?: boolean;
}

export type ContentObject = Record<string, MediaTypeObject>;
export interface MediaTypeObject {
  schema?: SchemaObject | ReferenceObject;
  examples?: ExamplesObject;
  example?: any;
  encoding?: EncodingObject;
}

export type EncodingObject = Record<string, EncodingPropertyObject>;
export interface EncodingPropertyObject {
  contentType?: string;
  headers?: Record<string, HeaderObject | ReferenceObject>;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
}

export interface ResponsesObject
  extends Record<string, ResponseObject | ReferenceObject | undefined> {
  default?: ResponseObject | ReferenceObject;
}

export interface ResponseObject {
  description: string;
  headers?: HeadersObject;
  content?: ContentObject;
  links?: LinksObject;
}

export type CallbacksObject = Record<string, CallbackObject | ReferenceObject>;
export type CallbackObject = Record<string, PathItemObject>;
export type HeadersObject = Record<string, HeaderObject | ReferenceObject>;

export interface ExampleObject {
  summary?: string;
  description?: string;
  value?: any;
  externalValue?: string;
}

export type LinksObject = Record<string, LinkObject | ReferenceObject>;
export interface LinkObject {
  operationRef?: string;
  operationId?: string;
  parameters?: LinkParametersObject;
  requestBody?: any | string;
  description?: string;
  server?: ServerObject;
}

export type LinkParametersObject = Record<string, any>;
export type HeaderObject = BaseParameterObject;
export interface TagObject {
  name: string;
  description?: string;
  externalDocs?: ExternalDocumentationObject;
}

export type ExamplesObject = Record<string, ExampleObject | ReferenceObject>;

export interface ReferenceObject {
  $ref: string | (() => string);
}

export interface SchemaObject {
  nullable?: boolean;
  discriminator?: DiscriminatorObject;
  readOnly?: boolean;
  writeOnly?: boolean;
  xml?: XmlObject;
  externalDocs?: ExternalDocumentationObject;
  example?: any;
  examples?: any[] | Record<string, any>;
  deprecated?: boolean;
  type?: string | (new (...args) => any) | (() => new (...args) => any);
  allOf?: (SchemaObject | ReferenceObject)[];
  oneOf?: (SchemaObject | ReferenceObject)[];
  anyOf?: (SchemaObject | ReferenceObject)[];
  not?: SchemaObject | ReferenceObject;
  items?: SchemaObject | ReferenceObject;
  properties?: Record<string, SchemaObject | ReferenceObject>;
  additionalProperties?: SchemaObject | ReferenceObject | boolean;
  patternProperties?: SchemaObject | ReferenceObject | any;
  description?: string;
  format?: string;
  default?: any;
  title?: string;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: boolean;
  minimum?: number;
  exclusiveMinimum?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  enum?: any[];
}

export type SchemasObject = Record<string, SchemaObject>;

export interface DiscriminatorObject {
  propertyName: string;
  mapping?: Record<string, string>;
}

export interface XmlObject {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
}

export type SecuritySchemeType = 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';

export interface SecuritySchemeObject {
  type: SecuritySchemeType;
  description?: string;
  name?: string;
  in?: string;
  scheme?: string;
  bearerFormat?: string;
  flows?: OAuthFlowsObject;
  openIdConnectUrl?: string;
}

export interface OAuthFlowsObject {
  implicit?: OAuthFlowObject;
  password?: OAuthFlowObject;
  clientCredentials?: OAuthFlowObject;
  authorizationCode?: OAuthFlowObject;
}

export interface OAuthFlowObject {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: ScopesObject;
}

export type ScopesObject = Record<string, any>;
export type SecurityRequirementObject = Record<string, string[]>;

/**
 * 非 open api spec
 */
export type SwaggerEnumType =
  | string[]
  | number[]
  | (string | number)[]
  | Record<number, string>;

export interface Type<T = any> {
  new (...args: any[]): T;
}

export interface SchemaObjectMetadata
  extends Omit<SchemaObject, 'type' | 'required'> {
  type?: Type<unknown> | [Type] | string | Record<string, any>;
  isArray?: boolean;
  required?: boolean;
  name?: string;
  enumName?: string;
}

export type AuthType =
  | 'basic'
  | 'bearer'
  | 'cookie'
  | 'oauth2'
  | 'apikey'
  | 'custom';

/**
 * 继承自 https://swagger.io/specification/#security-scheme-object
 */
export interface AuthOptions extends Omit<SecuritySchemeObject, 'type'> {
  /**
   * 验权类型
   * basic  => http basic 验证
   * bearer => http jwt 验证
   * cookie => cookie 方式验证
   * oauth2 => 使用 oauth2
   * apikey => apiKey
   * custom => 自定义方式
   */
  authType: AuthType;
  /**
   * https://swagger.io/specification/#security-scheme-object type 字段
   */
  type?: SecuritySchemeType;
  /**
   * authType = cookie 时可以修改，通过 ApiCookie 装饰器关联的名称
   */
  securityName?: string;
  /**
   * authType = cookie 时可以修改，cookie 的名称
   */
  cookieName?: string;
}
/**
 * see https://swagger.io/specification/
 */
export interface SwaggerOptions {
  /**
   * 默认值: My Project
   * https://swagger.io/specification/#info-object title 字段
   */
  title?: string;
  /**
   * 默认值: This is a swagger-ui for midwayjs project
   * https://swagger.io/specification/#info-object description 字段
   */
  description?: string;
  /**
   * 默认值: 1.0.0
   * https://swagger.io/specification/#info-object version 字段
   */
  version?: string;
  /**
   * https://swagger.io/specification/#info-object contact 字段
   */
  contact?: ContactObject;
  /**
   * https://swagger.io/specification/#info-object license 字段
   */
  license?: LicenseObject;
  /**
   * https://swagger.io/specification/#info-object termsOfService 字段
   */
  termsOfService?: string;
  /**
   * https://swagger.io/specification/#openapi-object externalDocs 字段
   */
  externalDocs?: ExternalDocumentationObject;
  /**
   * https://swagger.io/specification/#openapi-object servers 字段
   */
  servers?: Array<ServerObject>;
  /**
   * https://swagger.io/specification/#openapi-object tags 字段
   */
  tags?: Array<TagObject>;
  /**
   * 可以参考 https://swagger.io/specification/#security-scheme-object
   */
  auth?: AuthOptions | AuthOptions[];
  /**
   * 默认值: /swagger-ui
   * 访问 swagger ui 的路径
   */
  swaggerPath?: string;
  /**
   * 对路由 tag 进行 ascii 排序
   * 可以使用 1-xxx、2-xxx、3-xxx 来定义 tag
   */
  tagSortable?: boolean;
  /**
   * UI 展示中需要用到的配置
   * 可以参考 https://github.com/swagger-api/swagger-ui/blob/master/docs/usage/configuration.md#display
   */
  displayOptions?: {
    deepLinking?: boolean;
    displayOperationId?: boolean;
    defaultModelsExpandDepth?: number;
    defaultModelExpandDepth?: number;
    defaultModelRendering?: 'example' | 'model';
    displayRequestDuration?: boolean;
    docExpansion?: 'list' | 'full' | 'none';
    filter?: boolean | string;
    maxDisplayedTags?: number;
    showExtensions?: boolean;
    showCommonExtensions?: boolean;
    useUnsafeMarkdown?: boolean;
    tryItOutEnabled?: boolean;
  };
}
