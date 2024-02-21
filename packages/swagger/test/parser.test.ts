import {
  ApiBody,
  ApiExcludeController,
  ApiExcludeEndpoint,
  ApiExcludeSecurity, ApiExtension,
  ApiExtraModel,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiSecurity,
  ApiTags,
  getSchemaPath,
  SwaggerExplorer,
  Type
} from '../src';
import { Controller, Post, Get, Query, createRequestParamDecorator } from '@midwayjs/core';

class CustomSwaggerExplorer extends SwaggerExplorer {
  generatePath(target: Type) {
    return super.generatePath(target);
  }

  parse(clz) {
    return super.parseClzz(clz);
  }
}

describe('/test/parser.test.ts', function () {
  it('should fix issue#2286 with array example', function () {
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
          $ref: getSchemaPath(Catd)
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
      @ApiProperty({ description: '列表数据', type: 'array', items: { $ref: getSchemaPath(NotificationDTO) } })
      rows: NotificationDTO[]

      @ApiProperty({ example: '999', description: '通知数量' })
      count: number;
    }
    @ApiExtraModel(NotificationPageListDTO)
    class UserDTO {
      @ApiProperty({ example: 'Kitty', description: 'The name of the user' })
      name: string;

      @ApiProperty({ example: '1', description: 'The uid of the user' })
      uid: number;

      @ApiProperty({ description: 'The uid of the user', type: NotificationPageListDTO })
      data: NotificationPageListDTO
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
      @ApiProperty({ type: 'string' })
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
        }
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
        }
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
        }
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
              type: 'string'
            }
          }
        ]
      })
      name: string | string[];

      @ApiProperty({
        oneOf: [
          { type: Album },
          {
            type: 'array',
            items: {
              type: () => Album,
            }
          }
        ]
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
  })

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
      routerFilter: (url) => {
        return url === '/api/update_user';
      }
    };
    explorer.generatePath(APIController);
    const data = explorer.getData() as any;
    expect(data.paths['/api/update_user']).toBeUndefined();
    expect(data.paths['/api/get_user']).not.toBeUndefined();

    // tag is not empty
    expect(data.tags).toEqual([{
      name: 'api',
      description: 'api',
    }]);
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
      routerFilter: (url) => {
        return url === '/api/update_user' || url === '/api/get_user'
      }
    };
    explorer.generatePath(APIController);
    const data = explorer.getData() as any;
    expect(data.paths['/api/update_user']).toBeUndefined();
    expect(data.paths['/api/get_user']).toBeUndefined();

    // tag is empty
    expect(data.tags).toEqual([]);
  });

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
    const data = explorer.getData() as any;
    expect(data.tags.length).toBe(2);
    expect(data.tags[0].name).toBe('tag1');
    expect(data.tags[1].name).toBe('tag2');
  });

  it("should ignore custom param decorator", () => {
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

  it('should test ApiSecurity', () => {
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
