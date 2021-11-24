import {
  Controller,
  Post,
  Inject,
  Body,
} from '@midwayjs/decorator';
import { Context } from '../../../../../src';

class DataDTO {
  name: string;
  age: number;
}

@Controller('/api')
export class APIController {

  @Inject()
  ctx: Context;

  @Post()
  async postData(@Body() data: DataDTO) {
    return data;
  }
}
