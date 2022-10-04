import { Provide, Controller, Get, Inject } from '@midwayjs/core';
import { JwtService } from '@midwayjs/jwt';
import { JwtPassportMiddleware } from './jwt.middleware';

@Provide()
@Controller('/')
export class TestPackagesController {
  @Inject()
  req;

  @Inject()
  jwt: JwtService;

  @Get('/jwt-passport', { middleware: [JwtPassportMiddleware] })
  async jwtPassport() {
    if (this.req.user?.msg === 'midway') {
      return 'success';
    }

    return 'fail';
  }

  @Get('/gen-jwt')
  async genJwt(ctx) {
    return this.jwt.sign({ msg: 'midway' });
  }
}
