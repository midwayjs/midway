import {
  OpenAPIObject,
  ExternalDocumentationObject,
  SecurityRequirementObject,
  SecuritySchemeObject,
  ServerVariableObject,
  PathItemObject,
  SchemaObject,
  TagObject,
  PathsObject,
} from './interfaces';

export class DocumentBuilder {
  private readonly document: OpenAPIObject = {
    openapi: '3.0.1',
    info: {
      title: '',
      description: '',
      version: '1.0.0',
      contact: {},
    },
    tags: [],
    servers: [],
    components: {},
    paths: {},
  };

  public setTitle(title: string): this {
    this.document.info.title = title;
    return this;
  }

  public setDescription(description: string): this {
    this.document.info.description = description;
    return this;
  }

  public setVersion(version: string): this {
    this.document.info.version = version;
    return this;
  }

  public setTermsOfService(termsOfService: string): this {
    this.document.info.termsOfService = termsOfService;
    return this;
  }

  public setContact(name: string, url: string, email: string): this {
    this.document.info.contact = { name, url, email };
    return this;
  }

  public setLicense(name: string, url: string): this {
    this.document.info.license = { name, url };
    return this;
  }

  public addServer(
    url: string,
    description?: string,
    variables?: Record<string, ServerVariableObject>
  ): this {
    this.document.servers.push({ url, description, variables });
    return this;
  }

  public setExternalDoc(description: string, url: string): this {
    this.document.externalDocs = { description, url };
    return this;
  }

  public addPaths(paths: Record<string, PathItemObject>) {
    Object.assign(this.document.paths, paths);
    return this;
  }

  public getPaths(): PathsObject {
    return this.document.paths;
  }

  public setPaths(paths: Record<string, PathItemObject>) {
    this.document.paths = paths;
    return this;
  }

  public addSchema(schema: Record<string, SchemaObject>) {
    if (!this.document.components.schemas) {
      this.document.components.schemas = {};
    }
    Object.assign(this.document.components.schemas, schema);
    return this;
  }

  public getSchema(name: string): SchemaObject {
    if (this.document.components?.schemas) {
      return this.document.components?.schemas[name] as SchemaObject;
    }
    return undefined;
  }

  public addTag(
    name: string,
    description = '',
    externalDocs?: ExternalDocumentationObject
  ): this {
    const tags = this.document.tags || [];
    if (Array.isArray(name)) {
      const arr = name as Array<string>;
      for (const s of arr) {
        if (!tags.find(tag => tag.name === name)) {
          tags.push({
            name: s,
            description: '',
          });
        }
      }
      return this;
    }
    if (!tags.find(tag => tag.name === name)) {
      tags.push({
        name,
        description,
        externalDocs,
      });
    } else {
      // update description and externalDocs
      tags.forEach(tag => {
        if (tag.name === name) {
          if (description) {
            tag.description = description;
          }
          if (externalDocs) {
            tag.externalDocs = externalDocs;
          }
        }
      });
    }
    this.document.tags = tags;
    return this;
  }

  public addSecurity(name: string, options: SecuritySchemeObject): this {
    this.document.components.securitySchemes = {
      ...(this.document.components.securitySchemes || {}),
      [name]: options,
    };
    return this;
  }

  public addSecurityRequirements(
    name: string | SecurityRequirementObject,
    requirements: string[] = []
  ): this {
    let securityRequirement: SecurityRequirementObject;

    if (typeof name === 'string') {
      securityRequirement = { [name as string]: requirements };
    } else {
      securityRequirement = name as SecurityRequirementObject;
    }

    this.document.security = (this.document.security || []).concat({
      ...securityRequirement,
    });
    return this;
  }

  public addBearerAuth(
    options: SecuritySchemeObject = {
      type: 'http',
    },
    name = 'bearer'
  ): this {
    this.addSecurity(name, {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      ...options,
    });
    return this;
  }

  public addOAuth2(
    options: SecuritySchemeObject = {
      type: 'oauth2',
    },
    name = 'oauth2'
  ): this {
    if (!name) {
      name = 'oauth2';
    }
    this.addSecurity(name, {
      type: 'oauth2',
      flows: {
        ...options?.flows,
      },
    });
    return this;
  }

  public addApiKey(
    options: SecuritySchemeObject = {
      type: 'apiKey',
    },
    name = 'api_key'
  ): this {
    if (!name) {
      name = 'api_key';
    }
    this.addSecurity(name, {
      type: 'apiKey',
      in: 'header',
      name,
      ...options,
    });
    return this;
  }

  public addBasicAuth(
    options: SecuritySchemeObject = {
      type: 'http',
    },
    name = 'basic'
  ): this {
    if (!name) {
      name = 'basic';
    }
    this.addSecurity(name, {
      type: 'http',
      scheme: 'basic',
      ...options,
    });
    return this;
  }

  public addCookieAuth(
    cookieName = 'connect.sid',
    options: SecuritySchemeObject = {
      type: 'apiKey',
    },
    securityName = 'cookie'
  ): this {
    if (!cookieName) {
      cookieName = 'connect.sid';
    }
    if (!securityName) {
      securityName = 'cookie';
    }
    this.addSecurity(securityName, {
      type: 'apiKey',
      in: 'cookie',
      name: cookieName,
      ...options,
    });
    return this;
  }

  public sortTags(): void {
    const tags = this.document.tags;
    this.document.tags = tags.sort((a: TagObject, b: TagObject): number => {
      const s1 = a.name;
      const s2 = b.name;

      const len = s1.length > s2.length ? s2.length : s1.length;
      for (let i = 0; i < len; i++) {
        if (s1.charCodeAt(i) > s2.charCodeAt(i)) {
          return 1;
        } else if (s1.charCodeAt(i) < s2.charCodeAt(i)) {
          return -1;
        }
      }

      return 0;
    });
  }

  public build(): Omit<OpenAPIObject, 'paths'> {
    return this.document;
  }
}
