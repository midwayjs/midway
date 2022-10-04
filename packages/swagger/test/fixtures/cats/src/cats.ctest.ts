import { Body, Controller, Fields, File, Files, Get, Inject, Param, Post, Query } from '@midwayjs/core';
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
} from '../../../../src';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { Cat } from './entities/cat.entity';

@ApiTags('1-你好这里')
@Controller('/ctest')
@ApiHeader({
  name: 'x-test-one',
})
@ApiBasicAuth('bbb')
@ApiBearerAuth('ttt')
export class CatsTestController {
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
  async upload1(@Files() f: any[], @Fields() data: Cat) {
    return null;
  }

  @Post('/test2')
  async upload2(@Files() f: any[]) {
    return null;
  }
}
