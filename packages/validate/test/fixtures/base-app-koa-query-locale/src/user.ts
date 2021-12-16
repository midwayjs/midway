import { Controller, Post, Body } from '@midwayjs/decorator';
import { Validate, Rule, RuleType } from '../../../../src';

class UserDTO {
  @Rule(RuleType.string().max(10))
  name: string;
}

@Controller('/user')
export class UserController {
  @Post('/')
  @Validate()
  async aspectWithValidate(@Body() bodyData: UserDTO) {
    return bodyData;
  }
}
