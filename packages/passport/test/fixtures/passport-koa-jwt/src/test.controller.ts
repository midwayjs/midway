import { Provide, Controller, Get, Inject } from '@midwayjs/decorator';
import { JwtService } from '@midwayjs/jwt';

@Provide()
@Controller('/')
export class TestPackagesController {
  @Inject()
  ctx;

  @Inject()
  jwt: JwtService;

  @Get('/jwt-passport', { middleware: ['jwtPassportMiddleware'] })
  async jwtPassport() {
    if (this.ctx.state.user?.msg === 'midway') {
      return 'success';
    }

    return 'fail';
  }

  @Get('/gen-jwt')
  async genJwt(ctx) {
    return this.jwt.sign({ msg: 'midway' });
  }
}
