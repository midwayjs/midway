import { Body, Controller, Get, Inject, Param, Post, Query } from '@midwayjs/decorator';
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

@ApiTags('cats1')
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
  @ApiParam({ name: 'id', format: 'int32', description: 'hello world id number', example: 12})
  @ApiQuery({ name: 'test', enum: ['One', 'Two', 'Three']})
  findOne(@Param('id') id: string, @Query('test') test: any): Cat {
    return this.catsService.findOne(+id);
  }
}
