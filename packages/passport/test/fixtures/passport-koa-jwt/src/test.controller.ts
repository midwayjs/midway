import { Provide, Controller, Get, Inject } from '@midwayjs/decorator';
import { JwtService } from '../../../../../jwt/src';

@Provide()
@Controller('/')
export class TestPackagesController {
  @Inject()
  req;

  @Inject()
  jwt: JwtService;

  @Get('/jwt-passport', { middleware: ['jwtPassportMiddleware'] })
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
