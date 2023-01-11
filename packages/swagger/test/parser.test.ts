import { ApiExtraModel, ApiProperty, ApiResponse, getSchemaPath, SwaggerExplorer, Type } from '../src';
import { Controller, Post } from '@midwayjs/core';

class CustomSwaggerExplorer extends SwaggerExplorer {
  generatePath(target: Type) {
    return super.generatePath(target);
  }

  parseClzz(clz) {
    return super.parseClzz(clz);
  }
}

describe('/test/parser.test.ts', function () {
  it('should fix issue#2286 with array example', function () {
    class Catd {
      @ApiProperty({ example: 'Kitty', description: 'The name of the Cat'})
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
      @ApiProperty({ example: 'Kitty', description: 'The name of the Cat'})
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

    @Controller('/api', { middleware: []})
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
      @ApiProperty({ example: 'Kitty', description: 'The name of the Cat'})
      name: string;
    }

    @Controller('/api', { middleware: []})
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
      @ApiProperty({ example: '通知标题', description: 'title'})
      title: string;

      @ApiProperty({ example: '1', description: '这是 id'})
      id: number;
    }

    @ApiExtraModel(NotificationDTO)
    class NotificationPageListDTO {
      @ApiProperty({ description: '列表数据', type: 'array', items: { $ref: getSchemaPath(NotificationDTO) } })
      rows: NotificationDTO[]

      @ApiProperty({ example: '999', description: '通知数量'})
      count: number;
    }
    @ApiExtraModel(NotificationPageListDTO)
    class UserDTO {
      @ApiProperty({ example: 'Kitty', description: 'The name of the user'})
      name: string;

      @ApiProperty({ example: '1', description: 'The uid of the user'})
      uid: number;

      @ApiProperty({ description: 'The uid of the user', type: NotificationPageListDTO})
      data: NotificationPageListDTO
    }

    @Controller('/api', { middleware: []})
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
    expect(explorer.parseClzz(NotificationDTO)).toMatchSnapshot();
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
    expect(explorer.parseClzz(Photo)).toMatchSnapshot();
    expect(explorer.parseClzz(Album)).toMatchSnapshot();
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
    expect(explorer.parseClzz(Photo)).toMatchSnapshot();
    expect(explorer.parseClzz(Album)).toMatchSnapshot();
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
          { type: Album},
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
    expect(explorer.parseClzz(Photo)).toMatchSnapshot();
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
    expect(explorer.parseClzz(Cat)).toMatchSnapshot();
  });
});
