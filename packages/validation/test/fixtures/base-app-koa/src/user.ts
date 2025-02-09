import { Controller, Post, Body } from '@midwayjs/core';
import { Validate, Rule } from '../../../../src';
import { z } from 'zod';

class UserDTO {
  @Rule(z.string().max(10))
  name: string;
}

@Controller('/user')
export class UserController {
  @Post('/')
  @Validate({
    locale: 'zh_CN',
  })
  async aspectWithValidate(@Body() bodyData: UserDTO) {
    return bodyData;
  }

  @Post('/global_options')
  @Validate()
  async global_options(@Body() bodyData: UserDTO) {
    return bodyData;
  }
}
