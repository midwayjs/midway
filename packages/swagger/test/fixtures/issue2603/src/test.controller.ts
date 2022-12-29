import { Inject, Controller, Get, Query } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ApiResponse } from '../../../../src';
import { RoleVO, UserVO } from './dto';

@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;

  @ApiResponse({
    type: UserVO,
  })
  @Get('/get_user')
  async getUser(@Query('uid') uid: number) {
    return 'hello';
  }

  @ApiResponse({
    type: RoleVO,
  })
  @Get('/get_role')
  async getRole() {
    return [];
  }
}
