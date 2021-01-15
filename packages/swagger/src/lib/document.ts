function arrayToJSON(arr) {
  if (!arr) return;
  return arr.map(el => el.toJSON());
}

function arrayToObject(arr, objectKey: string) {
  if (!arr) return;
  const o = {};
  arr.forEach(el => {
    o[el[objectKey]] = el.toJSON();
  });
  return o;
}

export class SwaggerDocument {
  info: SwaggerDocumentInfo;
  host: string;
  basePath: string;
  tags: SwaggerDocumentTag[];
  schemes: string[];
  paths: SwaggerDocumentPaths;
  definitions: SwaggerDefinition[];

  constructor() {
    this.tags = [];
    this.paths = new SwaggerDocumentPaths();
    this.definitions = [];
  }

  addRouter(router: SwaggerDocumentRouter) {
    this.paths.routers.push(router);
  }

  toJSON() {
    return {
      openapi: '3.0.0',
      info: this.info?.toJSON(),
      host: this.host,
      basePath: this.basePath,
      tags: arrayToJSON(this.tags),
      schemas: this.schemes,
      paths: this.paths.toJSON(),
      components: {
        schemas: arrayToObject(this.definitions, 'name'),
      },
    };
  }
}

export class SwaggerDocumentInfo {
  description: string;
  version: string;
  title: string;
  termsOfService: any;
  contact: any;
  license: any;

  toJSON() {
    return {
      description: this.description,
      version: this.version,
      title: this.title,
      termsOfService: this.termsOfService,
      contact: this.contact,
      license: this.license,
    };
  }
}

export class SwaggerDocumentTag {
  name: string;
  description: string;

  toJSON() {
    return {
      name: this.name,
      description: this.description,
    };
  }
}

export class SwaggerDocumentPaths {
  routers: SwaggerDocumentRouter[] = [];

  toJSON() {
    const routers = {};
    for (const router of this.routers) {
      if (!routers[router.url]) {
        routers[router.url] = {};
      }
      routers[router.url][router.method] = router.toJSON();
    }
    return routers;
  }
}

export class SwaggerDocumentRouter {
  method: 'get' | 'post' | 'put' | 'delete' | 'options' | 'head' | 'patch';
  url: string;
  tags: string[];
  summary: string;
  description: string;
  operationId: string;
  consumes: string[];
  produces: string[];
  parameters: SwaggerDocumentParameter[];
  requestBody: object;
  responses: object;
  security: [];

  constructor(method, url) {
    this.method = method;
    this.url = url;
  }

  toJSON() {
    return {
      tags: this.tags,
      summary: this.summary,
      description: this.description,
      operationId: this.operationId,
      consumes: this.consumes,
      produces: this.produces,
      parameters: arrayToJSON(this.parameters),
      requestBody: this.requestBody,
      responses: this.responses,
    };
  }
}

export class SwaggerDocumentParameter {
  in: string;
  name: string;
  description: string;
  required: boolean;
  deprecated: boolean;
  allowEmptyValue: boolean;
  example: string;
  schema;

  toJSON() {
    return {
      in: this.in,
      name: this.name,
      description: this.description,
      required: this.required,
      deprecated: this.deprecated,
      allowEmptyValue: this.allowEmptyValue,
      schema: this.schema,
      example: this.example,
    };
  }
}

export class SwaggerDefinition {
  name: string;
  type: string;
  properties;
  required: string[];

  constructor() {
    this.properties = {};
    this.required = [];
  }

  toJSON() {
    return {
      type: this.type,
      properties: this.properties,
      required: this.required.length ? this.required: undefined,
    };
  }
}

