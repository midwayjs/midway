import { Controller, Get, Inject, Param, Provide, Query, Redirect, Post, Body, ALL } from '@midwayjs/decorator';
import { IMidwayKoaContext } from '@midwayjs/koa';
import { CreateApiDoc, CreateApiPropertyDoc } from '../../../../../src';

class homeDataDTO {
  value: string;
}

class UpdateDoc {
  @CreateApiPropertyDoc('文章标题')
  title: string;
  @CreateApiPropertyDoc('文章内容')
  content: string;
}

@Provide()
@Controller('/')
export class HomeController {
  @Inject()
  ctx: IMidwayKoaContext;

  @Get('/')
  async home() {
    return 'hello world';
  }

  @Get('/list')
  async listData(@Query() pageSize: number, @Query() pageIdx: number): Promise<homeDataDTO[]> {
    return [
      {
        value: '123'
      },
      {
        value: '321'
      }
    ];
  }

  @Get('/list/:id')
  async listDataById(@Param() id: number): Promise<homeDataDTO> {
    return {
      value: '123'
    };
  }

  @Get('/login')
  @Redirect('/')
  async redirect() {
  }

  @CreateApiDoc()
    .summary('创建导航拦')
    .description('')
    .param('标题参数')
    .param('描述参数')
    .param('父级id')
    .respond(200, '', 'json', {
      example:{
        "code": 200
      }
    })
    .build()

  @Post('/create_menu', {
    description: ''
  })
  async createMenu(
    @Body('title') title: string,
    @Body('desc') desc: string,
    @Body()  parentId: number,
  ){

  }

  @Post('/update_doc/:id', {
    description: ''
  })
  async updateDoc(
    @Param('id') id: number,
    @Body(ALL) body: UpdateDoc,
  ) {

  }
}
