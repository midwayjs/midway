import { ApiExtraModel, ApiProperty, ApiResponse, getSchemaPath, SwaggerExplorer, Type } from '../src';
import { Controller, Post } from '@midwayjs/decorator';

class CustomSwaggerExplorer extends SwaggerExplorer {
  generatePath(target: Type) {
    return super.generatePath(target);
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
});
