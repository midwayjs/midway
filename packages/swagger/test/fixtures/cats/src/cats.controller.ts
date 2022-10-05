import {
  Body,
  Controller,
  Fields,
  File,
  Files,
  Get,
  Inject,
  Param,
  Post,
  Query
} from '@midwayjs/core';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiBody,
  ApiExtension,
  ApiQuery,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
  ApiExtraModel,
} from '../../../../src';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { Cat } from './entities/cat.entity';
import { Cata } from './entities/cata.entity';
import { Catd } from './entities/catd.entity';
import { CatT } from './entities/catt.entity';
import { OssMultipleUploadResponseDto } from './entities/test';

@ApiExtraModel([CatT, Cata, Catd])
@ApiTags(['2-国家测试', 'sss'])
@Controller('/cats')
@ApiHeader({
  name: 'x-test-one',
})
@ApiBasicAuth('bbb')
@ApiBearerAuth('ttt')
export class CatsController {
  @Inject()
  private readonly catsService: CatsService

  @Post('/:id', { summary: 'test'})
  @ApiOperation({ summary: 'Create cat' })
  @ApiBody({ description: 'hello world', content: { 'application/octet-stream': { schema: { type: 'string', format:'binary' }}}})
  @ApiParam({ name: 'id', format: 'int32', description: 'hello world id number', example: 12})
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiNotFoundResponse({ description: 'NotFound.'})
  @ApiOkResponse({ type: Cat, description: '成功了'})
  async create(@Body() createCatDto: CreateCatDto, @Param('id') id: number): Promise<Cat> {
    return this.catsService.create(createCatDto);
  }

  @Get('/:id')
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: Cat,
  })
  @ApiExtension('x-hello', { hello: 'world' })
  @ApiParam({ name: 'id', description: 'hello world id number', example: 12})
  @ApiQuery({ name: 'test', enum: ['One', 'Two', 'Three']})
  @ApiQuery({ name: 'aa', enum: ['One', 'Two', 'Three']})
  findOne(@Param('id') id: string, @Query('test') test: any, @Query('aa') aa: any): Cat {
    return this.catsService.findOne(+id);
  }

  @Post('/test')
  @ApiBody({ description: 'hello file' })
  @ApiBody({ description: 'hello fields', type: Cat })
  async upload(@File() f: any, @Fields() data: Cat) {
    return null;
  }

  @Post('/test1')
  @ApiResponse({
    status: 200,
    content: {
      'application/json': {
        schema: {
          properties: {
            data: { '$ref': getSchemaPath(Cat)}
          }
        }
      }
    }
  })
  async upload1(@Files() f: any[], @Fields() data: Cat) {
    return null;
  }

  @Post('/test2', { description: 'hello test2', summary: 'hello test2 summary' })
  async upload2(@Files() f: any[]) {
    return null;
  }

  @Get('/test3', { description: 'hello test3', summary: 'hello test3 summary' })
  async get(@Body('aa') aa: string, @Body('bb') bb: string) {
    return null;
  }
  @Get('/test4')
  @ApiQuery({name: 'aa'})
  async getfour(@Query() aa: CreateCatDto, @Query('t') t: number, @Body('bb') bb: string) {
    return null;
  }

  @Post('/test5/{aa}')
  @ApiParam({name: 'aa'})
  @ApiBody({})
  @ApiResponse({
    type: OssMultipleUploadResponseDto
  })
  async getfive(@Param('aa') aa: CreateCatDto, @Body('bb') bb: string) {
    return null;
  }
}
