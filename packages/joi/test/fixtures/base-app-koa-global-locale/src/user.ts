import { Controller, Post, Body } from '@midwayjs/core';
import { Validate, Rule } from '@midwayjs/validation';
import * as Joi from 'joi';

class UserDTO {
  @Rule(Joi.string().max(10))
  name: string;
}

@Controller('/user')
export class UserController {
  @Post('/global_options')
  @Validate()
  async global_options(@Body() bodyData: UserDTO) {
    return bodyData;
  }
}
