import { Controller, Get } from '@midwayjs/core';
import {
  InjectEntityManager,
  InjectRepository,
} from '../../../../../../../../src';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../entity/user.entity';
import { EntityRepository } from '@mikro-orm/sqlite';
@Controller('/m1')
export class HomeController1 {
  @InjectEntityManager('default1')
  em: EntityManager;

  @InjectRepository(User, 'default1')
  userRepo2: EntityRepository<User>;

  @Get('/')
  async home() {
    return await this.em.findAll(User);
  }

  @Get('/withEntity')
  async withEntity() {
    return await this.userRepo2.findAll();
  }
}
