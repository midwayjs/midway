// home controller
import { Controller, Get, UseGuard } from '@midwayjs/core';
import { AuthActionVerb, AuthGuard, AuthPossession, UsePermission } from '@midwayjs/casbin';
import { Resource } from './resouce';

@Controller('/')
export class HomeController {

  @UseGuard(AuthGuard)
  @UsePermission({
    action: AuthActionVerb.READ,
    resource: Resource.USER_ROLES,
    possession: AuthPossession.ANY
  })
  @Get('/')
  async index() {
    return 'Hello World';
  }
}
