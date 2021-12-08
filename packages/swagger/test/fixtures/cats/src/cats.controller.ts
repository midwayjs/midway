import { Body, Controller, Get, Inject, Param, Post } from '@midwayjs/decorator';
import {
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
export class CatsController {
  @Inject()
  private readonly catsService: CatsService

  @Post('/:id', { summary: 'test'})
  @ApiOperation({ summary: 'Create cat' })
  @ApiParam({ name: 'createCatDto', type: CreateCatDto, description: 'hello world'})
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async create(@Body() createCatDto: CreateCatDto, @Param('id') id: number): Promise<Cat> {
    return this.catsService.create(createCatDto);
  }

  @Get('/:id')
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: Cat,
  })
  findOne(@Param('id') id: string): Cat {
    return this.catsService.findOne(+id);
  }
}
