import { Controller, Get } from '@midwayjs/core';
import { InjectEntityManager } from '../../../../../../../../src';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../entity/user.entity';
@Controller('/m1')
export class HomeController {

  @InjectEntityManager('default1')
  em: EntityManager;

  @Get('/')
  async home() {
    return await this.em.findAll(User);
  }
}
