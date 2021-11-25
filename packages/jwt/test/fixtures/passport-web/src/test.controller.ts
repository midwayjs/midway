import { Provide, Controller, Get, Inject } from '@midwayjs/decorator';
import { JWTService } from '../../../../src';

@Provide()
@Controller('/')
export class TestPackagesController {
  @Inject()
  ctx;

  @Inject()
  jwt: JWTService;

  @Get('/jwt-passport', { middleware: ['jwtPassportMiddleware'] })
  async jwtPassport() {
    if (this.ctx.req.user?.msg === 'midway') {
      return 'success';
    }

    return 'fail';
  }

  @Get('/gen-jwt')
  async genJwt(ctx) {
    return this.jwt.sign({ msg: 'midway' });
  }
}
