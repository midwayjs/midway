// home controller
import { Controller, Get, Inject, UseGuard } from '@midwayjs/core';
import { AuthActionVerb, AuthGuard, AuthPossession, CasbinEnforcerService, UsePermission } from '@midwayjs/casbin';
import { Resource } from './resouce';

@Controller('/')
export class HomeController {

  @Inject()
  casbinEnforcerService: CasbinEnforcerService;

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

  @Get('/add')
  async add() {
    await this.casbinEnforcerService.addRoleForUser('zhangting', 'manager');
  }
}
