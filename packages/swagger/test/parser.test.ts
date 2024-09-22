import {
  ApiAcceptedResponse,
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiDefaultResponse,
  ApiExcludeController,
  ApiExcludeEndpoint,
  ApiExcludeSecurity,
  ApiExtension,
  ApiExtraModel,
  ApiForbiddenResponse,
  ApiFoundResponse,
  ApiGatewayTimeoutResponse,
  ApiGoneResponse,
  ApiHeader,
  ApiHeaders,
  ApiInternalServerErrorResponse,
  ApiMethodNotAllowedResponse,
  ApiMovedPermanentlyResponse,
  ApiNoContentResponse,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiNotImplementedResponse,
  ApiOAuth2,
  ApiOkResponse,
  ApiOperation, ApiParam,
  ApiPayloadTooLargeResponse,
  ApiPreconditionFailedResponse,
  ApiProperty, ApiQuery,
  ApiRequestTimeoutResponse,
  ApiResponse,
  ApiSecurity,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
  ApiUnsupportedMediaTypeResponse,
  BodyContentType,
  getSchemaPath,
  SwaggerExplorer,
  Type,
} from '../src';
import {
  Controller,
  Post,
  Get,
  Query,
  createRequestParamDecorator,
  Body,
  File,
  Files,
  Param,
} from '@midwayjs/core';

class CustomSwaggerExplorer extends SwaggerExplorer {
  generatePath(target: Type) {
    return super.generatePath(target);
  }

  parse(clz) {
    return super.parseClzz(clz);
  }

  formatType(metadata) {
    return super.formatType(metadata);
  }
}

describe('/test/parser.test.ts', function () {
  it('should support deprecated field in ApiOperation', () => {
    @Controller('/api', { middleware: [] })
    class APIController {
      @ApiOperation({
        deprecated: true,
      })
      @Post('/update_user')
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test routerFilter', () => {
    @Controller('/api')
    class APIController {
      @Post('/update_user')
      async updateUser() {
        // ...
      }

      @Get('/get_user')
      async getUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer['swaggerConfig'] = {
      routerFilter: url => {
        return url === '/api/update_user';
      },
    };
    explorer.generatePath(APIController);
    const data = explorer.getData() as any;
    expect(data.paths['/api/update_user']).toBeUndefined();
    expect(data.paths['/api/get_user']).not.toBeUndefined();

    // tag is not empty
    expect(data.tags).toEqual([
      {
        name: 'api',
        description: 'api',
      },
    ]);
  });

  it('should test routerFilter and clean empty paths', () => {
    @Controller('/api')
    class APIController {
      @Post('/update_user')
      async updateUser() {
        // ...
      }

      @Get('/get_user')
      async getUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer['swaggerConfig'] = {
      routerFilter: url => {
        return url === '/api/update_user' || url === '/api/get_user';
      },
    };
    explorer.generatePath(APIController);
    const data = explorer.getData() as any;
    expect(data.paths['/api/update_user']).toBeUndefined();
    expect(data.paths['/api/get_user']).toBeUndefined();

    // tag is empty
    expect(data.tags).toEqual([]);
  });

  it('should ignore custom param decorator', () => {
    function Test() {
      return createRequestParamDecorator(ctx => {
        return ctx.test;
      });
    }

    @Controller('/api')
    class APIController {
      @Get('/get_user')
      async getUser(@Test() param: any, @Query('data') data: any) {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    const data = explorer.getData() as any;
    expect(data.paths['/api/get_user'].get.parameters.length).toEqual(1);
  });

  it('should fix issue#2286 with array example', () => {
    class Catd {
      @ApiProperty({ example: 'Kitty', description: 'The name of the Cat' })
      named: string;

      @ApiProperty({ example: 1, description: 'The age of the Cat' })
      aged: number;

      @ApiProperty({
        example: 'Maine Coon',
        description: 'The breed of the Cat',
      })
      breedd: string;
    }

    @ApiExtraModel(Catd)
    class Cat {
      @ApiProperty({ example: 'Kitty', description: 'The name of the Cat' })
      name: string;

      @ApiProperty({
        description: 'The breed of the Cat',
        required: false,
        type: 'array',
        items: {
          $ref: getSchemaPath(Catd),
        },
      })
      catds: Catd[];
    }

    @Controller('/api', { middleware: [] })
    class CatController {
      @ApiResponse({
        status: 200,
        description: 'The found record',
        type: Cat,
      })
      @Post('/update_user')
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(CatController);
    expect(explorer.getData()).toMatchSnapshot();
  });
});

describe('test @ApiExcludeController and @ApiExcludeEndpoint', () => {
  it('should test exclude controller', () => {
    @Controller('/api')
    @ApiExcludeController()
    class APIController {
      @Post('/update_user')
      async updateUser() {
        // ...
      }

      @Get('/get_user')
      async getUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    const data = explorer.getData() as any;
    expect(data.paths).toEqual({});
  });

  it('should test exclude endpoint', () => {
    @Controller('/api')
    class APIController {
      @Post('/update_user')
      async updateUser() {
        // ...
      }

      @ApiExcludeEndpoint()
      @Get('/get_user')
      async getUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    const data = explorer.getData() as any;
    expect(data.paths['/api/update_user']).not.toBeUndefined();
    expect(data.paths['/api/get_user']).toBeUndefined();
  });
});

describe('test @ApiHeaders and @ApiHeader', () => {
  it('should test ApiHeader', () => {
    @Controller('/api')
    @ApiHeader({
      name: 'x-test-one',
      description: 'this is test one',
    })
    class APIController {
      @Get('/get_user')
      async getUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test ApiHeader in method', () => {
    @Controller('/api')
    class APIController {
      @Get('/get_user')
      @ApiHeader({
        name: 'x-test-one',
        description: 'this is test one',
      })
      @ApiHeader({
        name: 'x-test-two',
        description: 'this is test two',
      })
      async getUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test ApiHeaders in class and method', () => {
    @Controller('/api')
    @ApiHeaders([
      {
        name: 'x-test-one',
        description: 'this is test one',
      },
      {
        name: 'x-test-two',
        description: 'this is test two',
      },
    ])
    class APIController {
      @Get('/get_user')
      @ApiHeaders([
        {
          name: 'x-test-three',
          description: 'this is test three',
        },
        {
          name: 'x-test-four',
          description: 'this is test four',
        },
      ])
      async getUser() {
        // ...
      }

      @Get('/get_user2')
      async anotherMethod() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });
});

describe('test @ApiBody', () => {
  it('should test ApiBody', () => {
    class Cat {
      /**
       * The name of the Catcomment
       * @example Kitty
       */
      @ApiProperty({ example: 'Kitty', description: 'The name of the Cat' })
      name: string;

      @ApiProperty({ example: 1, description: 'The age of the Cat' })
      age: number;
    }

    @Controller('/api')
    @ApiExtraModel(Cat)
    class APIController {
      @Post('/update_user')
      @ApiBody({ description: 'hello file' })
      @ApiBody({ description: 'hello fields', type: Cat })
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test ApiBody with array', () => {
    class Cat {
      @ApiProperty({ example: 'Kitty', description: 'The name of the Cat' })
      name: string;

      @ApiProperty({ example: 1, description: 'The age of the Cat' })
      age: number;
    }

    @Controller('/api')
    @ApiExtraModel(Cat)
    class APIController {
      @Post('/update_user')
      @ApiBody({
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                $ref: getSchemaPath(Cat),
              },
            },
          },
        },
      })
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test ApiBody with array false', () => {
    class Cat {
      /**
       * The name of the Catcomment
       * @example Kitty
       */
      @ApiProperty({ example: 'Kitty', description: 'The name of the Cat' })
      name: string;

      @ApiProperty({ example: 1, description: 'The age of the Cat' })
      age: number;
    }

    @Controller('/api')
    @ApiExtraModel(Cat)
    class APIController {
      @Post('/update_user')
      @ApiBody({
        type: Cat,
        isArray: false,
      })
      async updateUser(@Body() cat: Cat[]) {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test ApiBody with example', () => {
    class Cat {
      @ApiProperty({ example: 'Kitty', description: 'The name of the Cat' })
      name: string;

      @ApiProperty({ example: 1, description: 'The age of the Cat' })
      age: number;
    }

    @Controller('/api')
    @ApiExtraModel(Cat)
    class APIController {
      @Post('/update_user')
      @ApiBody({
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                $ref: getSchemaPath(Cat),
              },
            },
            example: 'Fluffy',
          },
        },
      })
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test ApiBody with examples', () => {
    class Cat {
      @ApiProperty({ example: 'Kitty', description: 'The name of the Cat' })
      name: string;

      @ApiProperty({ example: 1, description: 'The age of the Cat' })
      age: number;
    }

    @Controller('/api')
    @ApiExtraModel(Cat)
    class APIController {
      @Post('/update_user')
      @ApiBody({
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                $ref: getSchemaPath(Cat),
              },
            },
            examples: {
              example1: {
                summary: 'An example of a cat',
              },
              example2: {
                $ref: '#/components/examples/hamster'
              },
            }
          },
        },
      })
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test ApiBody with formData', () => {
    class Cat {
      @ApiProperty({ example: 'Kitty', description: 'The name of the Cat' })
      name: string;

      @ApiProperty({ example: 1, description: 'The age of the Cat' })
      age: number;
    }

    @Controller('/api')
    @ApiExtraModel(Cat)
    class APIController {
      @Post('/update_user')
      @ApiBody({
        required: true,
        content: {
          'application/x-www-form-urlencoded:': {
            schema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                },
                fav_number: {
                  type: 'integer',
                }
              },
              required: [
                'name',
              ]
            },
            encoding: {
              color: {
                style: 'form',
                explode: false,
              }
            }
          },
        },
      })
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test ApiBody with binary', () => {
    @Controller('/api')
    class APIController {
      @Post('/update_user')
      @ApiBody({
        required: true,
        content: {
          'image/png': {
            schema: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      })
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test ApiBody with multipart request', () => {
    @Controller('/api')
    class APIController {
      @Post('/update_user')
      @ApiBody({
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                },
                fav_number: {
                  type: 'integer',
                },
                file: {
                  type: 'string',
                  format: 'binary',
                },
              },
              required: [
                'name',
              ]
            },
          },
        },
      })
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test ApiBody with contentType', () => {
    class UploadType {
      @ApiProperty({ example: 'Kitty', description: 'The name of the Cat' })
      name: string;

      @ApiProperty({
        type: 'string',
        format: 'binary',
        description: 'this is file test'
      })
      file: any;
    }

    @Controller('/api')
    @ApiExtraModel(UploadType)
    class APIController {
      @Post('/update_user')
      @ApiBody({
        required: true,
        contentType: BodyContentType.Multipart,
        schema: {
          type: UploadType,
        }
      })
      async updateUser(@File() files: any) {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test ApiBody with contentType and files', () => {
    class UploadType {
      @ApiProperty({ example: 'Kitty', description: 'The name of the Cat' })
      name: string;

      @ApiProperty({
        type: 'array',
        items: {
          type: 'string',
          format: 'binary',
          description: 'this is file test'
        }
      })
      files: any;
    }

    @Controller('/api')
    @ApiExtraModel(UploadType)
    class APIController {
      @Post('/update_user')
      @ApiBody({
        required: true,
        contentType: BodyContentType.Multipart,
        schema: {
          type: UploadType,
        }
      })
      async updateUser(@Files() files: any) {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });
});

describe('test @ApiExtension', () => {
  it('should test ApiExtension', () => {
    @Controller('/api')
    class APIController {
      @Get('/get_user')
      @ApiExtension('x-hello', { hello: 'world' })
      async getUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });
});

describe('test @ApiSecurity', () => {
  it('should test ApiSecurity and @ApiExcludeSecurity', () => {
    @Controller('/api')
    @ApiSecurity('api_key')
    class APIController {
      @Post('/update_user')
      async updateUser() {
        // ...
      }

      @Get('/get_user')
      @ApiExcludeSecurity()
      async getUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test @ApiBasicAuth', () => {
    @Controller('/api')
    @ApiBasicAuth()
    class APIController {
      @Get('/get_user')
      async getUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test with @ApiBearerAuth', () => {
    @Controller('/api')
    @ApiBearerAuth()
    class APIController {
      @Get('/get_user')
      async getUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('test OAuth2', () => {
    @Controller('/api')
    @ApiOAuth2(['pets:write'])
    class APIController {
      @Get('/get_user')
      async getUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('test ApiCookieAuth', () => {
    @Controller('/api')
    @ApiCookieAuth()
    class APIController {
      @Get('/get_user')
      async getUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });
});

describe('test @ApiTags', () => {
  it('should test multi-tags', () => {
    @Controller('/api')
    @ApiTags(['tag1', 'tag2'])
    class APIController {
      @Post('/update_user')
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should add controller prefix for default tags when @ApiTag not set', () => {
    @Controller('/api')
    class APIController {
      @Post('/update_user')
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should add router @ApiTags', () => {
    @Controller('/api')
    class APIController {
      @ApiTags('tag1')
      @ApiTags('tag2')
      // @ApiOperation({ tags: ['tag3'] })
      @Post('/update_user')
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should swagger tags duplicate', () => {
    @Controller('/api')
    @ApiTags('tag1')
    class APIController {
      @Post('/update_user')
      async updateUser() {
        // ...
      }
    }

    @Controller('/api2')
    @ApiTags('tag1')
    class API2Controller {
      @Post('/update_user')
      async updateUser() {
        // ...
      }
    }

    @Controller('/api3')
    @ApiTags('tag2')
    class API3Controller {
      @Post('/update_user')
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    explorer.generatePath(API2Controller);
    explorer.generatePath(API3Controller);
    const data = explorer.getData() as any;
    expect(data.tags.length).toBe(2);
    expect(data.tags[0].name).toBe('tag1');
    expect(data.tags[1].name).toBe('tag2');
  });

  it("should test priority router greater than controller", () => {
    @Controller('/api')
    @ApiTags('tag1')
    class APIController {
      @ApiTags('tag2')
      @Post('/update_user')
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    const data = explorer.getData() as any;
    expect(data).toMatchSnapshot();
  });

  it("should test priority @ApiOperation greater than controller", () => {
    @Controller('/api')
    @ApiTags('tag1')
    class APIController {
      @ApiOperation({ tags: ['tag3'] })
      @Post('/update_user')
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    const data = explorer.getData() as any;
    expect(data).toMatchSnapshot();
  });

  it("should test priority router greater than controller and @ApiOperation", () => {
    @Controller('/api')
    @ApiTags('tag1')
    class APIController {
      @ApiTags('tag2')
      @ApiOperation({ tags: ['tag3'] })
      @Post('/update_user')
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    const data = explorer.getData() as any;
    expect(data).toMatchSnapshot();
  });

  it("should test priority router greater than controller and @ApiOperation but will merge tags", () => {
    @Controller('/api')
    @ApiTags(['tag1', 'tag2', 'tag3'])
    class APIController {
      @ApiTags('tag2')
      @ApiOperation({ tags: ['tag3'] })
      @Post('/update_user')
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    const data = explorer.getData() as any;
    expect(data).toMatchSnapshot();
  });

  it("should test priority router greater than controller and @ApiOperation but will merge tags 2", () => {
    @Controller('/api')
    @ApiTags(['tag1', 'tag2', 'tag3'])
    class APIController {
      @ApiTags(['tag2', 'tag4'])
      @ApiOperation({ tags: ['tag3'] })
      @Post('/update_user')
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    const data = explorer.getData() as any;
    expect(data).toMatchSnapshot();
  });

  it("should test priority router greater without controller tag", () => {
    @Controller('/api')
    class APIController {
      @ApiTags('tag2')
      @Post('/update_user')
      async updateUser() {
        // ...
      }

      @Post('/update_user_1')
      async updateUser1() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer['swaggerConfig'].isGenerateTagForController = false;
    explorer.generatePath(APIController);
    const data = explorer.getData() as any;
    expect(data).toMatchSnapshot();
  });

  it("should test priority @ApiOperation without controller tag", () => {
    @Controller('/api')
    class APIController {
      @ApiOperation({ tags: ['tag3'] })
      @Post('/update_user')
      async updateUser() {
        // ...
      }

      @Post('/update_user_1')
      async updateUser1() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer['swaggerConfig'].isGenerateTagForController = false;
    explorer.generatePath(APIController);
    const data = explorer.getData() as any;
    expect(data).toMatchSnapshot();
  });

  it("should test priority router greater without controller tag", () => {
    @Controller('/api')
    class APIController {
      @ApiTags('tag2')
      @ApiOperation({ tags: ['tag3'] })
      @Post('/update_user')
      async updateUser() {
        // ...
      }
      @Post('/update_user_1')
      async updateUser1() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer['swaggerConfig'].isGenerateTagForController = false;
    explorer.generatePath(APIController);
    const data = explorer.getData() as any;
    expect(data).toMatchSnapshot();
  });

  it("should test add tag description in controller", () => {
    @Controller('/api', { middleware: []})
    class APIController {
      @Post('/update_user')
      @ApiOperation({
        tags: ['tag1'],
        summary: 'it is summary',
        description: 'tag1 description'
      })
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    explorer.getDocumentBuilder().addTag('tag1', 'tag1 description');
    const data = explorer.getData() as any;
    expect(data).toMatchSnapshot();
  });
});

describe('test @ApiResponse', () => {
  it('should test ApiResponse', () => {
    @Controller('/api')
    class APIController {
      @Post('/update_user')
      @ApiResponse({
        status: 201,
        description: 'The record has been successfully created.',
      })
      @ApiResponse({ status: 403, description: 'Forbidden.' })
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test with schema', () => {
    @Controller('/api')
    class APIController {
      @Post('/update_user')
      @ApiResponse({
        status: 201,
        description: 'The record has been successfully created.',
        schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'The name of the Cat',
              example: 'Kitty',
            },
          },
        },
      })
      @ApiResponse({ status: 403, description: 'Forbidden.' })
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test with schema and set ref', () => {
    class Cat {
      @ApiProperty({ example: 'Kitty', description: 'The name of the Cat' })
      name: string;
    }

    @Controller('/api')
    class APIController {
      @Post('/update_user')
      @ApiResponse({
        status: 201,
        description: 'The record has been successfully created.',
        schema: {
          title: `response data`,
          allOf: [
            {
              $ref: getSchemaPath(Cat),
            },
            {
              type: 'object',
              properties: {
                age: {
                  type: 'number',
                  example: 1,
                },
              },
            },
          ],
        },
      })
      @ApiResponse({ status: 403, description: 'Forbidden.' })
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test use ApiOkResponse', () => {
    class Cat {
      @ApiProperty({ example: 'Kitty', description: 'The name of the Cat' })
      name: string;
    }

    @Controller('/api')
    class APIController {
      @Post('/update_user')
      @ApiOkResponse({
        description: 'The record has been successfully created.',
        schema: {
          title: `response data`,
          allOf: [
            {
              $ref: getSchemaPath(Cat),
            },
            {
              type: 'object',
              properties: {
                age: {
                  type: 'number',
                  example: 1,
                },
              },
            },
          ],
        },
      })
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test pre-defined response decorator', () => {
    // @ApiOkResponse()
    // @ApiCreatedResponse()
    // @ApiAcceptedResponse()
    // @ApiNoContentResponse()
    // @ApiMovedPermanentlyResponse()
    // @ApiFoundResponse()
    // @ApiBadRequestResponse()
    // @ApiUnauthorizedResponse()
    // @ApiNotFoundResponse()
    // @ApiForbiddenResponse()
    // @ApiMethodNotAllowedResponse()
    // @ApiNotAcceptableResponse()
    // @ApiRequestTimeoutResponse()
    // @ApiConflictResponse()
    // @ApiPreconditionFailedResponse()
    // @ApiTooManyRequestsResponse()
    // @ApiGoneResponse()
    // @ApiPayloadTooLargeResponse()
    // @ApiUnsupportedMediaTypeResponse()
    // @ApiUnprocessableEntityResponse()
    // @ApiInternalServerErrorResponse()
    // @ApiNotImplementedResponse()
    // @ApiBadGatewayResponse()
    // @ApiServiceUnavailableResponse()
    // @ApiGatewayTimeoutResponse()
    // @ApiDefaultResponse()

    @Controller('/api')
    class APIController {
      @Get('/apiOkResponse')
      @ApiOkResponse()
      async apiOkResponse() {
        // ...
      }

      @Get('/apiCreatedResponse')
      @ApiCreatedResponse()
      async apiCreatedResponse() {
        // ...
      }

      @Get('/apiAcceptedResponse')
      @ApiAcceptedResponse()
      async apiAcceptedResponse() {
        // ...
      }

      @Get('/apiNoContentResponse')
      @ApiNoContentResponse()
      async apiNoContentResponse() {
        // ...
      }

      @Get('/apiMovedPermanentlyResponse')
      @ApiMovedPermanentlyResponse()
      async apiMovedPermanentlyResponse() {
        // ...
      }

      @Get('/apiFoundResponse')
      @ApiFoundResponse()
      async apiFoundResponse() {
        // ...
      }

      @Get('/apiBadRequestResponse')
      @ApiBadRequestResponse()
      async apiBadRequestResponse() {
        // ...
      }

      @Get('/apiUnauthorizedResponse')
      @ApiUnauthorizedResponse()
      async apiUnauthorizedResponse() {
        // ...
      }

      @Get('/apiNotFoundResponse')
      @ApiNotFoundResponse()
      async apiNotFoundResponse() {
        // ...
      }

      @Get('/apiForbiddenResponse')
      @ApiForbiddenResponse()
      async apiForbiddenResponse() {
        // ...
      }

      @Get('/apiMethodNotAllowedResponse')
      @ApiMethodNotAllowedResponse()
      async apiMethodNotAllowedResponse() {
        // ...
      }

      @Get('/apiNotAcceptableResponse')
      @ApiNotAcceptableResponse()
      async apiNotAcceptableResponse() {
        // ...
      }

      @Get('/apiRequestTimeoutResponse')
      @ApiRequestTimeoutResponse()
      async apiRequestTimeoutResponse() {
        // ...
      }

      @Get('/apiConflictResponse')
      @ApiConflictResponse()
      async apiConflictResponse() {
        // ...
      }

      @Get('/apiPreconditionFailedResponse')
      @ApiPreconditionFailedResponse()
      async apiPreconditionFailedResponse() {
        // ...
      }

      @Get('/apiTooManyRequestsResponse')
      @ApiTooManyRequestsResponse()
      async apiTooManyRequestsResponse() {
        // ...
      }

      @Get('/apiGoneResponse')
      @ApiGoneResponse()
      async apiGoneResponse() {
        // ...
      }

      @Get('/apiPayloadTooLargeResponse')
      @ApiPayloadTooLargeResponse()
      async apiPayloadTooLargeResponse() {
        // ...
      }

      @Get('/apiUnsupportedMediaTypeResponse')
      @ApiUnsupportedMediaTypeResponse()
      async apiUnsupportedMediaTypeResponse() {
        // ...
      }

      @Get('/apiUnprocessableEntityResponse')
      @ApiUnprocessableEntityResponse()
      async apiUnprocessableEntityResponse() {
        // ...
      }

      @Get('/apiInternalServerErrorResponse')
      @ApiInternalServerErrorResponse()
      async apiInternalServerErrorResponse() {
        // ...
      }

      @Get('/apiNotImplementedResponse')
      @ApiNotImplementedResponse()
      async apiNotImplementedResponse() {
        // ...
      }

      @Get('/apiBadGatewayResponse')
      @ApiBadGatewayResponse()
      async apiBadGatewayResponse() {
        // ...
      }

      @Get('/apiServiceUnavailableResponse')
      @ApiServiceUnavailableResponse()
      async apiServiceUnavailableResponse() {
        // ...
      }

      @Get('/apiGatewayTimeoutResponse')
      @ApiGatewayTimeoutResponse()
      async apiGatewayTimeoutResponse() {
        // ...
      }

      @Get('/apiDefaultResponse')
      @ApiDefaultResponse()
      async apiDefaultResponse() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test response with type', () => {
    class Cat {
      @ApiProperty({ example: 'Kitty', description: 'The name of the Cat' })
      name: string;
    }

    @Controller('/api')
    class APIController {
      @Post('/update_user')
      @ApiResponse({ status: 200, type: Cat })
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test @ApiCreatedResponse with type', () => {
    class Cat {
      @ApiProperty({ example: 'Kitty', description: 'The name of the Cat' })
      name: string;
    }

    @Controller('/api')
    class APIController {
      @Post('/update_user')
      @ApiCreatedResponse({ type: Cat })
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test with array type', () => {
    class Cat {
      name: string;
    }

    @Controller('/api')
    class APIController {
      @Post('/update_user')
      @ApiCreatedResponse({ type: Cat, isArray: true })
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test with content and content type', () => {
    class Cat {
      name: string;
    }

    @Controller('/api')
    class APIController {
      @Post('/update_user')
      @ApiResponse({
        status: 200,
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                $ref: getSchemaPath(Cat),
              },
            }
          },
          'application/xml': {
            schema: {
              $ref: getSchemaPath(Cat),
            }
          },
          'text/plain': {
            schema: {
              type: 'string',
            }
          }
        }
      })
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });
});

describe('test @ApiProperty', () => {
  it('should test simple case with example', function () {
    class Cat {
      @ApiProperty({ example: 'Kitty', description: 'The name of the Cat' })
      name: string;
    }

    @Controller('/api', { middleware: [] })
    class CatController {
      @ApiResponse({
        status: 200,
        description: 'The found record',
        type: Cat,
      })
      @Post('/update_user')
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(CatController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test ref path generate', function () {
    class NotificationDTO {
      @ApiProperty({ example: '通知标题', description: 'title' })
      title: string;

      @ApiProperty({ example: '1', description: '这是 id' })
      id: number;
    }

    @ApiExtraModel(NotificationDTO)
    class NotificationPageListDTO {
      @ApiProperty({
        description: '列表数据',
        type: 'array',
        items: { $ref: getSchemaPath(NotificationDTO) },
      })
      rows: NotificationDTO[];

      @ApiProperty({ example: '999', description: '通知数量' })
      count: number;
    }

    @ApiExtraModel(NotificationPageListDTO)
    class UserDTO {
      @ApiProperty({ example: 'Kitty', description: 'The name of the user' })
      name: string;

      @ApiProperty({ example: '1', description: 'The uid of the user' })
      uid: number;

      @ApiProperty({
        description: 'The uid of the user',
        type: NotificationPageListDTO,
      })
      data: NotificationPageListDTO;
    }

    @Controller('/api', { middleware: [] })
    class APIController {
      @ApiResponse({
        status: 200,
        description: 'The found record',
        type: UserDTO,
      })
      @Post('/update_user')
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test specify type', function () {
    class NotificationDTO {
      @ApiProperty({type: 'string'})
      id: number;
    }

    const explorer = new CustomSwaggerExplorer();
    expect(explorer.parse(NotificationDTO)).toMatchSnapshot();
  });

  it('should parse ref schema with function', function () {
    class Photo {
      @ApiProperty()
      id: number;

      @ApiProperty()
      name: string;

      @ApiProperty({
        type: 'array',
        items: {
          $ref: () => getSchemaPath(Album),
        },
      })
      albums: Album[];
    }

    class Album {
      @ApiProperty()
      id: number;

      @ApiProperty()
      name: string;

      @ApiProperty({
        type: 'array',
        items: {
          $ref: () => getSchemaPath(Photo),
        },
      })
      photos: Photo[];
    }

    const explorer = new CustomSwaggerExplorer();
    expect(explorer.parse(Photo)).toMatchSnapshot();
    expect(explorer.parse(Album)).toMatchSnapshot();
  });

  it('should parse type with function', function () {
    class Photo {
      @ApiProperty()
      id: number;

      @ApiProperty()
      name: string;

      @ApiProperty({
        type: () => {
          return Album;
        },
      })
      album: any;
    }

    class Album {
      @ApiProperty()
      id: number;

      @ApiProperty()
      name: string;

      @ApiProperty({
        type: Photo,
      })
      photo: Photo;
    }

    const explorer = new CustomSwaggerExplorer();
    expect(explorer.parse(Photo)).toMatchSnapshot();
    expect(explorer.parse(Album)).toMatchSnapshot();
  });

  it('should test multi-type in property', function () {
    class Album {
      @ApiProperty()
      id: number;

      @ApiProperty()
      name: string;
    }

    class Photo {
      @ApiProperty({
        oneOf: [
          { type: 'string' },
          {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        ],
      })
      name: string | string[];

      @ApiProperty({
        oneOf: [
          { type: Album },
          {
            type: 'array',
            items: {
              type: () => Album,
            },
          },
        ],
      })
      album: Album | Album[];
    }

    const explorer = new CustomSwaggerExplorer();
    expect(explorer.parse(Photo)).toMatchSnapshot();
  });

  it('should parse base type', function () {
    class Cat {
      @ApiProperty({
        type: [String],
        example: ['1'],
        description: 'The name of the Catage',
        nullable: true,
        uniqueItems: true,
      })
      breeds: string[];
    }

    const explorer = new CustomSwaggerExplorer();
    expect(explorer.parse(Cat)).toMatchSnapshot();
  });

  it('should parse extends base', () => {
    class MyBase {
      @ApiProperty({ format: 'date-time' })
      created_at?: Date;
    }

    class SubA extends MyBase {
      @ApiProperty()
      a: number;
    }

    class SubB extends MyBase {
      @ApiProperty()
      b: number;
    }

    class SubC extends MyBase {
      @ApiProperty()
      c: number;
    }

    const explorer = new CustomSwaggerExplorer();
    expect(explorer.parse(SubA)).toMatchSnapshot();
    expect(explorer.parse(SubB)).toMatchSnapshot();
    expect(explorer.parse(SubC)).toMatchSnapshot();
  });

  it('should test raw definition with array', () => {
    class Cat {
      @ApiProperty({
        type: 'array',
        items: {
          type: 'number',
        },
      })
      coords: number[];
    }

    const explorer = new CustomSwaggerExplorer();
    expect(explorer.parse(Cat)).toMatchSnapshot();
  });

  it('should test raw definition with nested array', () => {
    class Cat {
      @ApiProperty({
        type: 'array',
        items: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
      })
      coords: number[][];
    }

    const explorer = new CustomSwaggerExplorer();
    expect(explorer.parse(Cat)).toMatchSnapshot();
  });
});

describe('test property metadata parse', () => {
  const swaggerExplorer = new CustomSwaggerExplorer();
  it('should format string type correctly', () => {
    const result = swaggerExplorer.formatType({ type: 'string' });
    expect(result).toEqual({ type: 'string' });
  });

  it('should format number type correctly', () => {
    const result = swaggerExplorer.formatType({ type: 'number' });
    expect(result).toEqual({ type: 'number' });
  });

  it('should format boolean type correctly', () => {
    const result = swaggerExplorer.formatType({ type: 'boolean' });
    expect(result).toEqual({ type: 'boolean' });
  });

  it('should format array type correctly', () => {
    const result = swaggerExplorer.formatType({ type: 'array', items: { type: 'string' } });
    expect(result).toEqual({ type: 'array', items: { type: 'string' } });
  });

  it('should format date type correctly', () => {
    const result = swaggerExplorer.formatType({ type: 'date' });
    expect(result).toEqual({ type: 'string', format: 'date-time' });
  });

  it('should format object type correctly', () => {
    const result = swaggerExplorer.formatType({
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        id: {
          type: 'integer',
        },
      }
    });
    expect(result).toEqual({
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        id: {
          type: 'integer',
        },
      }
    });
  });

  it('should format complex object type', () => {
    class TestClass {
      code: string;
    }
    const result = swaggerExplorer.formatType({
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        id: {
          type: 'integer',
        },
        obj: {
          type: TestClass,
        },
        obj2: {
          type: 'object',
          properties: {
            test: {
              type: 'string',
            }
          }
        }
      }
    });
    expect(result).toEqual({
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        id: {
          type: 'integer',
        },
        obj: {
          $ref: '#/components/schemas/TestClass',
        },
        obj2: {
          type: 'object',
          properties: {
            test: {
              type: 'string',
            }
          }
        }
      }
    });
  });

  it('should format function type correctly', () => {
    const result = swaggerExplorer.formatType({ type: () => 'string' });
    expect(result).toEqual({ type: 'string' });
  });

  it('should format class type correctly', () => {
    class TestClass {}
    const result = swaggerExplorer.formatType({ type: TestClass });
    expect(result).toHaveProperty('$ref');
    expect(result['$ref']).toContain('TestClass');
  });

  it('should format array class type correctly', () => {
    class TestClass {}
    const result = swaggerExplorer.formatType({ type: [TestClass] });
    expect(result).toEqual({ type: 'array', items: { $ref: '#/components/schemas/TestClass' } });
  });

  it('should format () => Type for circular dependencies ', () => {
    class TestClass {}
    const result = swaggerExplorer.formatType({ type: () => TestClass });
    expect(result).toEqual({ $ref: '#/components/schemas/TestClass' });
  });

  it('should format with () => [Class]', () => {
    class TestClass {}
    const result = swaggerExplorer.formatType({ type: () => [TestClass] });
    expect(result).toEqual({ type: 'array', items: { $ref: '#/components/schemas/TestClass' } });
  });

  it('should format metadata with pattern or format', () => {
    const result = swaggerExplorer.formatType({ type: 'string', format: 'email' });
    expect(result).toEqual({ type: 'string', format: 'email' });

    const result2 = swaggerExplorer.formatType({ type: 'string', pattern: '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$' });
    expect(result2).toEqual({ type: 'string', pattern: '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$' });
  });

  it('should format number with minimum, exclusiveMinimum or maximum ', () => {
    const result = swaggerExplorer.formatType({ type: 'number', minimum: 1, exclusiveMinimum: true, maximum: 10 });
    expect(result).toEqual({ type: 'number', minimum: 1, exclusiveMinimum: true, maximum: 10 });

    const result2 = swaggerExplorer.formatType({ type: 'number', minimum: 1, maximum: 10 });
    expect(result2).toEqual({ type: 'number', minimum: 1, maximum: 10 });

    const result3 = swaggerExplorer.formatType({ type: 'number', exclusiveMinimum: true, maximum: 10 });
    expect(result3).toEqual({ type: 'number', exclusiveMinimum: true, maximum: 10 });
  });

  it('should format number with nullable', () => {
    const result = swaggerExplorer.formatType({ type: 'number', nullable: true });
    expect(result).toEqual({ type: 'number', nullable: true });
  });

  it('should format array contain object', () => {
    const result = swaggerExplorer.formatType({
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string'
          },
          id: {
            type: 'integer'
          }
        }
      }
    });
    expect(result).toEqual({
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string'
          },
          id: {
            type: 'integer'
          }
        }
      }
    });
  });

  it('should format with oneOf type', () => {
    const result = swaggerExplorer.formatType({
      type: 'array',
      items: {
        oneOf: [
          { $ref: '#/components/schemas/Cat' },
          { $ref: '#/components/schemas/Dog' }
        ]
      }
    });

    expect(result).toEqual({
      type: 'array',
      items: {
        oneOf: [
          { $ref: '#/components/schemas/Cat' },
          { $ref: '#/components/schemas/Dog' }
        ]
      }
    });
  });

  it('should format with oneOf and different type ', () => {
    class Cat {}
    const result = swaggerExplorer.formatType({
      type: 'array',
      items: {
        oneOf: [
          { type: 'string' },
          { $ref: '#/components/schemas/Cat' },
          {
            type: Cat,
          },
          {
            type: [Cat],
          },
          {
            type: () => Cat,
          },
          {
            type: 'array',
            items: {
              type: Cat,
            },
          }
        ]
      }
    });

    expect(result).toEqual({
      type: 'array',
      items: {
        oneOf: [
          { type: 'string' },
          { $ref: '#/components/schemas/Cat' },
          { $ref: '#/components/schemas/Cat' },
          {
            "items": {
              "$ref": "#/components/schemas/Cat"
            },
            "type": "array"
          },
          { $ref: '#/components/schemas/Cat' },
          { type: 'array', items: { $ref: '#/components/schemas/Cat' } }
        ]
      }
    });
  });

  it('should format with anyOf', () => {
    const result = swaggerExplorer.formatType({
      type: 'array',
      items: {
        anyOf: [
          { type: 'string' },
          { type: 'number' }
        ]
      }
    });

    expect(result).toEqual({
      type: 'array',
      items: {
        anyOf: [
          { type: 'string' },
          { type: 'number' }
        ]
      }
    });
  });

  it('should format with allOf', () => {
    const result = swaggerExplorer.formatType({
      type: 'object',
      allOf: [
        { $ref: '#/components/schemas/Cat' },
        { $ref: '#/components/schemas/Dog' }
      ]
    });

    expect(result).toEqual({
      allOf: [
        { $ref: '#/components/schemas/Cat' },
        { $ref: '#/components/schemas/Dog' }
      ]
    });
  });

  it('should format with not and ref', () => {
    const result = swaggerExplorer.formatType({
      not: { $ref: '#/components/schemas/Cat' }
    });

    expect(result).toEqual({
      not: { $ref: '#/components/schemas/Cat' }
    });
  });

  it('should format with not and custom class', () => {
    class Cat {}
    const result = swaggerExplorer.formatType({
      not: {
        type: Cat
      }
    });

    expect(result).toEqual({
      not: {
        $ref: '#/components/schemas/Cat'
      }
    });
  });

  it('should format with not and complex array type', () => {
    class Cat {}
    const result = swaggerExplorer.formatType({
      not: {
        type: 'array',
        items: {
          type: () => Cat
        }
      }
    });

    expect(result).toEqual({
      not: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Cat'
        }
      }
    });
  });

  it('should format enum', () => {
    const result = swaggerExplorer.formatType({
      type: 'string',
      enum: ['a', 'b', 'c'],
      description: 'abc'
    });

    expect(result).toEqual({
      type: 'string',
      enum: ['a', 'b', 'c'],
      description: 'abc'
    });
  });

  it('should format enum with null', () => {
    const result = swaggerExplorer.formatType({
      type: 'string',
      nullable: true,
      enum: ['a', 'b', 'c', null]
    });

    expect(result).toEqual({
      type: 'string',
      nullable: true,
      enum: ['a', 'b', 'c', null]
    });
  });

  it('should format additionalProperties', () => {
    const result = swaggerExplorer.formatType({
      type: 'object',
      additionalProperties: {
        type: 'string'
      }
    });

    expect(result).toEqual({
      type: 'object',
      additionalProperties: {
        type: 'string'
      }
    });
  });

  it('should format additionalProperties with ref', () => {
    class Cat {}
    const result = swaggerExplorer.formatType({
      type: 'object',
      additionalProperties: {
        type: Cat
      }
    });

    expect(result).toEqual({
      type: 'object',
      additionalProperties: {
        $ref: '#/components/schemas/Cat'
      }
    });
  });

  it('should format additionalProperties with Free-Form Objects', () => {
    const result = swaggerExplorer.formatType({
      type: 'object',
      additionalProperties: true
    });

    expect(result).toEqual({
      type: 'object',
      additionalProperties: true
    });
  });
});

describe('test @ApiOperation', () => {
  it('should test deprecated', () => {
    @Controller('/api')
    class APIController {
      @ApiOperation({
        deprecated: true,
      })
      @Post('/update_user')
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test tags', () => {
    @Controller('/api')
    class APIController {
      @ApiOperation({
        tags: ['tag1', 'tag2'],
      })
      @Post('/update_user')
      async updateUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test summary and description', () => {
    @Controller('/api')
    class APIController {
      @ApiOperation({
        summary: 'update user',
        description: 'update user description',
      })
      @Post('/update_user')
      async updateUser() {
        // ...
      }
    }
    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test custom operationId', () => {
    @Controller('/api')
    class APIController {
      @ApiOperation({
        operationId: 'updateUser',
      })
      @Post('/update_user')
      async updateUser() {
        // ...
      }
    }
    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });
});

describe('test @ApiQuery', () => {
  it('should test with @query decorator and any type', () => {
    @Controller('/api')
    class APIController {
      @Get('/get_user')
      async getUser(@Query() data: any) {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test with @query decorator and fixed name', () => {
    @Controller('/api')
    class APIController {
      @Get('/get_user')
      async getUser(@Query('data') data: any) {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test with @query decorator and @ApiQuery', () => {
    @Controller('/api')
    class APIController {
      @Get('/get_user')
      @ApiQuery({ name: 'data', description: 'The name of the user', type: 'string'})
      @ApiQuery({ name: 'id', schema: {type: 'number'} })
      async getUser(@Query('data') data: any, @Query('id') id: any) {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test merge @query and @ApiQuery', () => {
    @Controller('/api')
    class APIController {
      @Get('/get_user')
      @ApiQuery({ name: 'data', description: 'The name of the user', type: 'string', required: false})
      async getUser(@Query('data') data: any, @Query('id') id: any) {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should get base type from @query', () => {
    @Controller('/api')
    class APIController {
      @Get('/get_user')
      async getUser(
        @Query('data') data: string,
        @Query('id') id: number,
        @Query('flag') flag: boolean,
        @Query('list') list: string[],
      ) {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should get class type from DTO', () => {
    class UserDTO {
      @ApiProperty({
        description: 'The name of the user',
      })
      name: string;

      @ApiProperty({
        description: 'The uid of the user',
      })
      id: number;
    }

    @Controller('/api')
    class APIController {
      @Get('/get_user')
      async getUser(@Query() user: UserDTO) {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should get class type from DTO with required', () => {
    class UserDTO {
      @ApiProperty({
        description: 'The name of the user',
        required: true,
      })
      name: string;

      @ApiProperty({
        description: 'The uid of the user',
        required: false,
      })
      id: number;
    }

    @Controller('/api')
    class APIController {
      @Get('/get_user')
      async getUser(@Query() user: UserDTO) {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should get array type from DTO', () => {
    class UserDTO {
      @ApiProperty({
        description: 'The name of the user',
      })
      name: string;

      @ApiProperty({
        description: 'The uid of the user',
      })
      id: number;
    }

    @Controller('/api')
    class APIController {
      @Get('/get_user')
      @ApiQuery({ name: 'user', type: UserDTO, isArray: true })
      async getUser(@Query() user: UserDTO[]) {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should get enum type', () => {
    enum Status {
      ACTIVE = 'active',
      INACTIVE = 'inactive',
    }

    @Controller('/api')
    class APIController {
      @Get('/get_user')
      @ApiQuery({ name: 'status', enum: Status })
      async getUser(@Query('status') status: Status) {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should get class type from DTO with description', () => {
    class UserDTO {
      @ApiProperty({
        description: 'The name of the user',
        required: true,
      })
      name: string;

      @ApiProperty({
        description: 'The uid of the user',
        required: false,
      })
      id: number;
    }

    @Controller('/api')
    class APIController {
      @Get('/get_user')
      async getUser(@Query() user: UserDTO) {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });
});

describe('test post args without @ApiBody', () => {
  it('post with any type', () => {
    @Controller('/api')
    class APIController {
      @Post('/update_user')
      async updateUser(@Body() data: any) {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('post with class type', () => {
    class UserDTO {
      @ApiProperty({
        description: 'The name of the user',
      })
      name: string;

      @ApiProperty({
        description: 'The uid of the user',
      })
      id: number;
    }
    @Controller('/api')
    class APIController {
      @Post('/update_user')
      async updateUser(@Body() data: UserDTO) {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('post with string type', () => {
    @Controller('/api')
    class APIController {
      @Post('/update_user')
      async updateUser(@Body() data: string) {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('post with array type', () => {
    @Controller('/api')
    class APIController {
      @Post('/update_user')
      async updateUser(@Body() data: number[]) {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('post with class array type', () => {
    class UserDTO {
      @ApiProperty({
        description: 'The name of the user',
      })
      name: string;

      @ApiProperty({
        description: 'The uid of the user',
      })
      id: number;
    }
    @Controller('/api')
    class APIController {
      @Post('/update_user')
      async updateUser(@Body() data: UserDTO[]) {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test with @File and any type', () => {
    @Controller('/api')
    class APIController {
      @Post('/update_user')
      async updateUser(@File() file: any) {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test with @Files and any type', () => {
    @Controller('/api')
    class APIController {
      @Post('/update_user')
      async updateUser(@Files() file: any) {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });
});

describe('test @ApiParam', () => {
  it('should test with @ApiParam decorator', () => {
    @Controller('/api')
    class APIController {
      @Get('/get_user/:id')
      @ApiParam({ name: 'id', description: 'The id of the user', type: 'number' })
      async getUser() {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });

  it('should test with @Param decorator', () => {
    @Controller('/api')
    class APIController {
      @Get('/get_user/:id')
      async getUser(@Param('id') id: number) {
        // ...
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  });
});

describe('test Generics class', () => {
  it('should test with generics class', () => {

    type Res<T> = {
      code: number;
      message: string;
      data: T;
    }

    function SuccessWrapper<T>(ResourceCls: Type<T>): Type<Res<T>> {
      class Result<T> implements Res<T> {
        @ApiProperty({ description: '状态码' })
        code: number;

        @ApiProperty({ description: '消息' })
        message: string;

        @ApiProperty({
          type: ResourceCls,
        })
        data: T;
      }

      return Result;
    }

    class User {
      @ApiProperty()
      name: string;

      @ApiProperty()
      id: number;
    }

    class SuccessUser extends SuccessWrapper<User>(User) {}

    @Controller('/api')
    class APIController {
      @Post('/update_user')
      @ApiCreatedResponse({ type: SuccessUser })
      async updateUser(@Body() data: SuccessUser) {
        const successUser = new SuccessUser();
        successUser.code = 200;
        successUser.message = 'Success';
        successUser.data = {
          name: 'Kitty',
          id: 1,
        };
        return successUser;
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  })

  it('should test with generics and multi implementation', () => {

    type Res<T> = {
      code: number;
      message: string;
      data: T;
    }

    function SuccessWrapper<T>(ResourceCls: Type<T>[]): Type<Res<T>> {
      class Result<T> implements Res<T> {
        @ApiProperty({ description: '状态码' })
        code: number;

        @ApiProperty({ description: '消息' })
        message: string;

        @ApiProperty({
          oneOf: ResourceCls.map(cls => ({ type: cls })),
        })
        data: T;
      }

      return Result;
    }

    class User {
      @ApiProperty()
      name: string;

      @ApiProperty()
      id: number;
    }

    class AnotherUser {
      @ApiProperty()
      name: string;

      @ApiProperty()
      sex: boolean;
    }

    class SuccessUser extends SuccessWrapper<User | AnotherUser>([User, AnotherUser]) {}

    @Controller('/api')
    class APIController {
      @Post('/update_user')
      @ApiOkResponse({ type: SuccessUser })
      async updateUser(@Body() data: SuccessUser) {
        const successUser = new SuccessUser();
        successUser.code = 200;
        successUser.message = 'Success';
        successUser.data = {
          name: 'Kitty',
          sex: true,
        };
        return successUser;
      }
    }

    const explorer = new CustomSwaggerExplorer();
    explorer.generatePath(APIController);
    expect(explorer.getData()).toMatchSnapshot();
  })
});
