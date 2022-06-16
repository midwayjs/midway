import { ApiProperty } from '../../../../../src';

class baseDTO {
  @ApiProperty({
    example: '17755556666',
    description: '11位手机号码',
  })
  phone: string;

  @ApiProperty({
    enum: ['sport', 'question'],
    example: 'sport',
    description: '产品线',
  })
  site: string;
}
export class CodeLoginDTO extends baseDTO {
  @ApiProperty({
    example: '0000',
    description: '验证码',
  })
  code: string;

  @ApiProperty({
    example: 'xxxx',
    description: '随机数',
  })
  uuid: string;
}

export class LoginDTO extends baseDTO {
  @ApiProperty({
    example: 'xxx',
    description: '密码',
  })
  password: string;
}

